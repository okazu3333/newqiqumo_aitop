# Vercel Deployment Guide

## Overview

This application uses **ephemeral SQLite** database that resets on each deployment. This is intentional for demo/mock data purposes.

## Database Strategy

- **Database Type**: SQLite (file-based)
- **Persistence**: None (resets on each deployment)
- **Purpose**: Mock data for demonstrations
- **Seed Data**: Automatically populated on each deployment

## Deployment Steps

### 1. Configure Environment Variables

Set the following environment variables in Vercel Dashboard:

```bash
# Database (automatically set, no need to configure)
DATABASE_URL="file:./deploy.db"

# Basic Authentication (Required)
BASIC_AUTH_USER="your-username"
BASIC_AUTH_PASSWORD="your-secure-password"

# Optional
NEXT_PUBLIC_LOGIC_CHECK_SPREADSHEET_ID="your-google-sheet-id"
```

### 2. Deploy to Vercel

#### Using Vercel CLI
```bash
cd apps/web
vercel
```

#### Using GitHub Integration
1. Push code to GitHub
2. Import repository in Vercel Dashboard
3. Set root directory to `apps/web`
4. Vercel will automatically detect Next.js and use the correct build settings

### 3. Automatic Database Setup

The build process automatically handles database setup during each deployment:

1. **Removes any existing database** (ensures clean state)
2. **Generates Prisma Client**
3. **Creates new database with schema** (using `prisma db push`)
4. **Seeds database with mock data**
5. **Builds Next.js application**

## Build Command Details

The `vercel-build` script handles the complete setup:
```bash
# 1. Remove old database files
rm -f prisma/*.db prisma/*.db-journal

# 2. Generate Prisma Client
npx prisma generate

# 3. Create database schema
npx prisma db push --skip-seed

# 4. Seed with mock data
npx prisma db seed

# 5. Build Next.js app
next build --turbopack
```

## Mock Data

Each deployment creates fresh mock data including:
- 顧客満足度調査
- 社内アンケート  
- 製品フィードバック

This data is defined in `packages/database/prisma/seed.ts`

## Notes on Data Persistence

**Important**: This setup is designed for demo/POC purposes where data persistence is NOT required. Each deployment will:
- Start with a clean database
- Populate with the same mock data
- Lose all changes when redeployed

If you need data persistence in the future, consider:
- Turso (SQLite edge database)
- PostgreSQL on Vercel Postgres
- External database services

## Troubleshooting

### Database Connection Issues
- Ensure DATABASE_URL is properly set in Vercel environment variables
- Check that migrations have run successfully in build logs

### Build Failures
- Verify all dependencies are installed
- Check build logs for Prisma generation errors
- Ensure package paths are correct in vercel.json

### Authentication Issues
- Verify BASIC_AUTH_USER and BASIC_AUTH_PASSWORD are set
- Check middleware configuration in middleware.ts

## Monitoring

Monitor your deployment:
1. Check Vercel Functions logs for API errors
2. Monitor database connections
3. Review build logs for migration status

## Local Testing of Production Build

Test the production build locally:
```bash
# Set production environment
export DATABASE_URL="file:./prod.db"

# Run production build
bun run vercel-build

# Start production server
bun start
```