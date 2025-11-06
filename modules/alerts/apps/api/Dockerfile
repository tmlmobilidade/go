# # #
# Base image
FROM node:24-alpine AS base

ENV MODULE=alerts
ENV APP=api
ENV TURBO_VERSION=2

# Install turbo once globally (reused across all stages)
RUN npm install -g turbo@^${TURBO_VERSION}

WORKDIR /app

# # # # # # # # #

# # #
# Installer stage
FROM base AS installer

WORKDIR /app

COPY . .

# Generate a package-lock.json based on current state
RUN npm install --package-lock-only

# # # # # # # # #

# # #
# Pruner stage
FROM base AS pruner

WORKDIR /app

# Copy everything needed for prune,
# including the generated lock file.
COPY --from=installer /app .

# Prune down to only needed deps/files
RUN turbo prune --scope=@tmlmobilidade/go-${MODULE}-${APP} --docker

# # # # # # # # #

# # #
# Builder stage
FROM base AS builder

WORKDIR /app

# Copy pruned dependency files first for cache
COPY --from=pruner /app/out/json/ ./

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

# Copy only the built app and dependencies,
# packages need to be included because node_modules symlinks to them.
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/modules/${MODULE}/apps/${APP}/dist/ .

CMD node src/index.js