# # #
# BASE IMAGE
FROM node:24-alpine AS base

ENV MODULE=alerts
ENV APP=frontend
ENV TURBO_VERSION=2

# Install turbo once globally (reused across all stages)
RUN npm install -g turbo@^${TURBO_VERSION}

WORKDIR /app

# # # # # # # # #

# # #
# INSTALLER STAGE
FROM base AS installer

WORKDIR /app

# Copy minimal files needed to compute dependencies
COPY . .

# Generate a package-lock.json based on current state
RUN npm install --package-lock-only

# # # # # # # # #

# # #
# PRUNER STAGE
FROM base AS pruner

WORKDIR /app

# Copy everything needed for prune, including the generated lock file
COPY --from=installer /app .

# Prune down to only needed deps/files
RUN turbo prune --scope=@tmlmobilidade/go-${MODULE}-${APP} --docker

# # # # # # # # #

# # #
# BUILDER STAGE
FROM base AS builder

WORKDIR /app

# Copy pruned dependency files first for cache
COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

# Install dependencies using the generated lockfile
RUN npm ci

# Copy full source for building
COPY --from=pruner /app/out/full/ .

# Build the app
RUN turbo run build --filter=@tmlmobilidade/go-${MODULE}-${APP}

# # # # # # # # #

# # #
# RUNNER STAGE
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP}/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP}/.next/static ./apps/${APP}/.next/static

CMD node /app/apps/${APP}/server.js
