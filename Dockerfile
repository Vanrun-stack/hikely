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

# Install dependencies (postinstall runs prisma generate here)
RUN pnpm install --frozen-lockfile --filter web...

# ─── Stage 2: Build ──────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy source code
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY apps/web ./apps/web

# Install dependencies (pnpm symlinks must stay intact)
RUN pnpm install --frozen-lockfile --filter web...

# Generate Prisma client (output: src/generated/prisma)
RUN cd apps/web && npx prisma generate

# Build Next.js standalone
ENV NEXT_TELEMETRY_DISABLED=1
ENV DOCKER=1
RUN pnpm --filter web build

# ─── Stage 3: Production ─────────────────────────────────────────
FROM node:22-alpine AS runner

RUN apk add --no-cache wget openssl

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# ─── Standalone output ────────────────────────────────────────────
# Confirmed standalone structure (pnpm monorepo):
#   standalone/ -> copied to /app/
#     apps/web/server.js   <- entry point
#     apps/web/.next/      <- server bundles
#     node_modules/        <- bundled deps
# public + static must sit next to server.js
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone           ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public                     ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static               ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/prisma                     ./apps/web/prisma

# Fix for Next.js 15 monorepo static files (CSS/JS 404s)
# Next.js sometimes resolves .next/static from the workspace root instead of the project root.
# We create symlinks at the root level to ensure they are found either way.
RUN mkdir -p /app/.next && \
    ln -s /app/apps/web/.next/static /app/.next/static && \
    ln -s /app/apps/web/public /app/public

# Pre-install Prisma CLI as root so nextjs user can run it
RUN npm install -g prisma@5 --no-save && \
    # Pre-fetch engines so nextjs user doesn't need write access
    prisma --version 2>/dev/null || true

# Entrypoint
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=30s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
# cd to apps/web so process.cwd() = /app/apps/web — Next.js finds .next/static correctly
CMD ["sh", "-c", "cd /app/apps/web && exec node server.js"]
