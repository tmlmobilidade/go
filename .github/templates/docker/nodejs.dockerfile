# # #

FROM node:24-slim AS base


# # #
# MODULE CONFIGURATION

ARG MODULE
ARG APP

ENV MODULE=${MODULE}
ENV APP=${APP}


# # #
# GLOBAL DEPENDENCIES

RUN npm install -g turbo@^2


# # #
# PRUNER STAGE
# Copy all files and run turbo prune to create a minimal monorepo
# with only the necessary files for building the specified module/app.

FROM base AS pruner

WORKDIR /app

COPY . .

RUN turbo prune --scope=@tmlmobilidade/go-${MODULE}-${APP} --docker


# # #
# BUILD DEPS STAGE
# Install all dependencies (including dev) once for the build.

FROM base AS build-deps

WORKDIR /app

COPY --from=pruner /app/out/json/ .

RUN npm ci


# # #
# BUILDER STAGE
# Build the app with dev dependencies available.

FROM build-deps AS builder

WORKDIR /app

COPY --from=pruner /app/out/full/ .

RUN npx @tmlmobilidade/repo-version --output=/app/modules/${MODULE}/apps/${APP}/package.json

RUN turbo run build --filter=@tmlmobilidade/go-${MODULE}-${APP}

# Reinstall only production deps and materialize workspace links
# so the final runner image only needs node_modules + dist.
RUN npm ci --omit=dev --install-links


# # #
# RUNNER STAGE
# Use a clean base image (no global turbo).
# Local package symlinks are already embedded in node_modules via --install-links,
# so only node_modules and the built dist are needed.

FROM gcr.io/distroless/nodejs24 AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/modules/${MODULE}/apps/${APP}/dist ./dist

CMD ["node", "dist/index.js"]