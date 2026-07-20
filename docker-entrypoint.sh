#!/bin/sh
# ═══════════════════════════════════════════════════════════════════
#  HIKELY — Docker Entrypoint
#  Syncs DB schema then starts the app
# ═══════════════════════════════════════════════════════════════════

echo "🏔️  Hikely — Starting up..."

# Sync DB schema if DATABASE_URL is set (non-fatal: DB may not be ready yet)
if [ -n "$DATABASE_URL" ]; then
  echo "📦 Syncing database schema..."
  prisma db push \
    --schema=./apps/web/prisma/schema.prisma \
    --skip-generate \
    --accept-data-loss 2>&1 \
    && echo "✅ DB schema synced" \
    || echo "⚠️  DB sync failed — app will start anyway, retry on next restart"
fi

echo "🚀 Starting Hikely on port ${PORT:-3000}..."

# Execute the CMD (node apps/web/server.js)
exec "$@"
