#!/bin/bash

echo "🚀 Starting Vercel build process..."

# Set environment variables for SQLite
export DATABASE_URL="${DATABASE_URL:-file:./prod.db}"

# Navigate to database package
cd packages/database

echo "📦 Installing Prisma dependencies..."
npm install

echo "🔨 Generating Prisma Client..."
npx prisma generate

echo "🗄️ Running database migrations..."
# Create the database file if it doesn't exist
touch prisma/prod.db

# Run migrations
npx prisma migrate deploy

echo "✅ Database setup complete!"

# Navigate to web app
cd ../../apps/web

echo "🏗️ Building Next.js application..."
next build --turbopack

echo "✨ Build complete!"