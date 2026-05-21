#!/bin/sh
set -e

echo "⏳ Applying database schema..."
# Use db push for a zero-migration first boot; idempotent and safe to re-run.
npx prisma db push --skip-generate --accept-data-loss

echo "🌱 Seeding tournament data..."
# Pre-compiled seed (plain JS, no ts-node needed). Idempotent via upserts.
node dist/seed/seed.js || echo "Seed step skipped/failed (data may already exist) — continuing."

echo "🚀 Starting API..."
exec node dist/main.js
