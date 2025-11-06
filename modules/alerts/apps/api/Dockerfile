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

# Copy minimal files needed to compute dependencies
COPY package.json turbo.json ./

# Copy all packages except "ui" for efficiency
COPY packages ./packages
RUN rm -rf ./packages/ui

COPY modules/${MODULE}/apps/${APP} ./modules/${MODULE}/apps/${APP}

# Generate a package-lock.json based on current state
RUN npm install --package-lock-only

# # # # # # # # #

# # #
# Pruner stage
FROM base AS pruner

WORKDIR /app

# Copy everything needed for prune, including the generated lock file
COPY --from=installer /app/package-lock.json ./package-lock.json
COPY package.json turbo.json ./
COPY packages ./packages
COPY modules/${MODULE}/apps/${APP} ./modules/${MODULE}/apps/${APP}

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
COPY --from=builder /app .

CMD node modules/${MODULE}/apps/${APP}/dist/src/index.js