# ═══════════════════════════════════════════════════════════════════
#  HIKELY — Worker Dockerfile (BullMQ)
# ═══════════════════════════════════════════════════════════════════
FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apk add --no-cache python3 make g++ openssl gdal-tools

# ─── Dependencies ─────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/gpx-utils/package.json ./packages/gpx-utils/
RUN pnpm install --frozen-lockfile

# ─── Builder ──────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN cd apps/api && pnpm prisma generate
RUN pnpm --filter api build

# ─── Runner ───────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 worker
RUN apk add --no-cache gdal-tools

COPY --from=builder --chown=worker:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=worker:nodejs /app/apps/api/node_modules ./node_modules
COPY --from=builder --chown=worker:nodejs /app/apps/api/prisma ./prisma

USER worker

CMD ["node", "dist/workers/main.js"]
