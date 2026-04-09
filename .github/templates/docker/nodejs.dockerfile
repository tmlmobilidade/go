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
# BUILDER STAGE
# Build the app in the pruned monorepo.
# First install dependencies, as they change less often.

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

RUN npm ci --omit-dev


# # #
# RUNNER STAGE
# Use a clean base image (no global turbo).
# Local package symlinks are already embedded in node_modules via --install-links,
# so only node_modules and the built dist are needed.

FROM gcr.io/distroless/nodejs24-debian13 AS runner

WORKDIR /app

ARG MODULE
ARG APP

COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/modules ./modules

COPY --from=builder /app/modules/${MODULE}/apps/${APP}/dist .

CMD ["index.js"]