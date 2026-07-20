# ═══════════════════════════════════════════════════════════════════
#  HIKELY — Multi-Stage Dockerfile (Next.js Full-Stack)
# ═══════════════════════════════════════════════════════════════════

# ─── Stage 1: Dependencies ────────────────────────────────────────
FROM node:22-alpine AS deps

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy workspace config + lockfile first (better cache)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/web/prisma ./apps/web/prisma

# Install dependencies
RUN pnpm install --frozen-lockfile --filter web...

# ─── Stage 2: Build ──────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy source code
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY apps/web ./apps/web

# Install dependencies (required for pnpm symlinks to work correctly)
RUN pnpm install --frozen-lockfile --filter web...

# Generate Prisma client
RUN cd apps/web && npx prisma generate

# Build Next.js (standalone for minimal image)
ENV NEXT_TELEMETRY_DISABLED=1
ENV DOCKER=1
RUN pnpm --filter web build

# ─── Stage 3: Production ─────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# wget for healthcheck
RUN apk add --no-cache wget

# Non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy Next.js standalone output (includes server.js + bundled deps)
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

# Copy Prisma for runtime DB sync
COPY --from=builder /app/apps/web/prisma ./prisma
# Install only Prisma CLI for db push in entrypoint
RUN npm install -g prisma@5 --no-save 2>/dev/null || true

# Entrypoint: run migrations then start
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=20s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
