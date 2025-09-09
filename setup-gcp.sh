#!/bin/bash

# GCP Setup Script for Survey PoC
# This script sets up the necessary GCP resources for deployment

set -e

# Configuration
PROJECT_ID=${1:-"your-gcp-project-id"}
REGION="asia-northeast1"
SERVICE_NAME="survey-poc"
REPOSITORY_NAME="survey-poc"

echo "🚀 Setting up GCP environment for Survey PoC..."
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"

# Set the project
echo "📋 Setting GCP project..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Create Artifact Registry repository
echo "📦 Creating Artifact Registry repository..."
gcloud artifacts repositories create $REPOSITORY_NAME \
    --repository-format=docker \
    --location=$REGION \
    --description="Docker repository for Survey PoC" || echo "Repository may already exist"

# Configure Docker authentication
echo "🔐 Configuring Docker authentication..."
gcloud auth configure-docker $REGION-docker.pkg.dev

# Create Cloud Run service (initial deployment)
echo "🌐 Creating Cloud Run service..."
gcloud run deploy $SERVICE_NAME \
    --image=gcr.io/cloudrun/hello \
    --region=$REGION \
    --platform=managed \
    --allow-unauthenticated \
    --port=3000 \
    --memory=2Gi \
    --cpu=2 \
    --max-instances=10 \
    --set-env-vars=NODE_ENV=production \
    --set-env-vars=DATABASE_URL="file:./packages/database/dev.db" \
    --set-env-vars=BASIC_AUTH_USER=cmgadmin \
    --set-env-vars=BASIC_AUTH_PASSWORD=crossadmin || echo "Service may already exist"

# Create service account for GitHub Actions
echo "👤 Creating service account for GitHub Actions..."
gcloud iam service-accounts create github-actions-sa \
    --display-name="GitHub Actions Service Account" \
    --description="Service account for GitHub Actions deployment" || echo "Service account may already exist"

# Grant necessary permissions to the service account
echo "🔑 Granting permissions to service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions-sa@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions-sa@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions-sa@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/artifactregistry.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions-sa@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions-sa@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"

# Generate service account key
echo "🔐 Generating service account key..."
gcloud iam service-accounts keys create github-actions-key.json \
    --iam-account=github-actions-sa@$PROJECT_ID.iam.gserviceaccount.com

echo "✅ GCP setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Add the following secrets to your GitHub repository:"
echo "   - GCP_PROJECT_ID: $PROJECT_ID"
echo "   - GCP_SA_KEY: (contents of github-actions-key.json)"
echo ""
echo "2. Update the PROJECT_ID in deploy-cloudrun.sh if needed"
echo ""
echo "3. Push your code to GitHub to trigger automatic deployment"
echo ""
echo "🔗 Your Cloud Run service URL:"
gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)' || echo "Service not yet deployed"
echo ""
echo "🔑 Service account key saved to: github-actions-key.json"
echo "   Please add this to GitHub Secrets and then delete the local file for security." 