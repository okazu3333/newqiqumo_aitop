#!/usr/bin/env bash
set -euo pipefail

echo "[vercel-build] Ensuring Prisma environment variables..."
# Fallback: if DATABASE_URL is missing but POSTGRES_URL is provided, use it
if [ -z "${DATABASE_URL:-}" ] && [ -n "${POSTGRES_URL:-}" ]; then
  export DATABASE_URL="$POSTGRES_URL"
fi
# If PRISMA_DATABASE_URL is missing, fall back to DATABASE_URL so schema validation passes
if [ -z "${PRISMA_DATABASE_URL:-}" ] && [ -n "${DATABASE_URL:-}" ]; then
  export PRISMA_DATABASE_URL="$DATABASE_URL"
fi

echo "PRISMA_DATABASE_URL=${PRISMA_DATABASE_URL:-unset}"
echo "DATABASE_URL=${DATABASE_URL:-unset}"

# Generate client
prisma generate

# Only push/seed when we have a direct DATABASE_URL
if [ -n "${DATABASE_URL:-}" ]; then
  echo "[vercel-build] Running prisma db push..."
  prisma db push
  echo "[vercel-build] Running prisma db seed..."
  prisma db seed
else
  echo "[vercel-build] DATABASE_URL missing. Skipping db push/seed."
fi

# Build Next.js
next build 