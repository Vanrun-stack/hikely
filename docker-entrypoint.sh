#!/bin/sh
# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
#  HIKELY â€” Docker Entrypoint
#  Runs Prisma DB sync before starting the application
# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

set -e

echo "ðŸ”ï¸  Hikely â€” Starting up..."

# Sync DB schema if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "ðŸ“¦ Syncing database schema..."
  prisma db push --schema=./prisma/schema.prisma --skip-generate --accept-data-loss 2>&1 || \
    echo "âš ï¸  DB sync failed (database may not be ready, will retry on next restart)"
fi

echo "ðŸš€ Starting Hikely on port ${PORT:-3000}..."

# Execute the original CMD
exec "$@"
