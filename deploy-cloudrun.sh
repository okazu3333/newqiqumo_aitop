#!/bin/bash

# Cloud Run deployment script for Survey PoC

# Configuration
PROJECT_ID="your-gcp-project-id"  # Replace with your GCP project ID
REGION="asia-northeast1"          # Tokyo region
SERVICE_NAME="survey-poc"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Starting Cloud Run deployment..."

# Build and push Docker image
echo "📦 Building Docker image..."
docker build -t ${IMAGE_NAME} .

echo "📤 Pushing image to Google Container Registry..."
docker push ${IMAGE_NAME}

# Deploy to Cloud Run
echo "🌐 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --port 3000 \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production \
  --set-env-vars DATABASE_URL="file:./packages/database/dev.db" \
  --set-env-vars BASIC_AUTH_USER=cmgadmin \
  --set-env-vars BASIC_AUTH_PASSWORD=crossadmin

echo "✅ Deployment completed!"
echo "🔗 Your application should be available at:"
gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format='value(status.url)' 