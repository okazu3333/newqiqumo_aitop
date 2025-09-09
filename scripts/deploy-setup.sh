#!/bin/bash

echo "🚀 Starting deployment setup..."

# Set database URL for ephemeral SQLite
export DATABASE_URL="file:./deploy.db"

echo "📦 Setting up database package..."
cd packages/database

# Remove any existing database file
rm -f prisma/deploy.db
rm -f prisma/deploy.db-journal

echo "🗄️ Creating fresh database..."
# Generate Prisma Client
npx prisma generate

# Push schema directly (faster than migrations for ephemeral DB)
npx prisma db push --skip-seed

echo "🌱 Seeding database with mock data..."
npx prisma db seed

echo "✅ Database setup complete!"

# Return to web directory for build
cd ../../apps/web

echo "📝 Database info:"
echo "  - Location: packages/database/prisma/deploy.db"
echo "  - Type: SQLite (ephemeral)"
echo "  - Seeded: Yes"