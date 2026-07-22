# # #

FROM node:alpine AS base


# # #
# MODULE CONFIGURATION

ARG MODULE
ARG APP

ENV MODULE=${MODULE}
ENV APP=${APP}


# # #
# ENVIRONMENT ARGUMENTS

ARG ENVIRONMENT

ENV ENVIRONMENT=${ENVIRONMENT}
ENV NEXT_PUBLIC_ENVIRONMENT=${ENVIRONMENT}


# # #
# GLOBAL DEPENDENCIES

RUN npm install -g turbo@^2


# # #
# PRUNER STAGE

FROM base AS pruner

ARG MODULE
ARG APP

WORKDIR /app

# Copy everything including package-lock.json from workflow cache
COPY . .

RUN turbo prune --docker @tmlmobilidade/go-${MODULE}-${APP}


# # #
# BUILDER STAGE

FROM base AS builder

ARG MODULE
ARG APP

WORKDIR /app

RUN apt-get update
RUN apt-get install -y python3 build-essential
RUN rm -rf /var/lib/apt/lists/*

# First install the dependencies (as they change less often)
COPY --from=pruner /app/out/json/ .
RUN npm ci

COPY .github/templates/docker/scripts /app/.docker/scripts

# Build the app
COPY --from=pruner /app/out/full/ .

COPY assets /app/assets

RUN npx @tmlmobilidade/repo-version --output=/app/modules/${MODULE}/apps/${APP}/package.json

RUN turbo run build --filter=@tmlmobilidade/go-${MODULE}-${APP}

RUN node /app/.docker/scripts/trim-node-modules.js /app/modules/${MODULE}/apps/${APP}/.next/standalone/node_modules
RUN node /app/.docker/scripts/trim-workspaces.js /app/modules/${MODULE}/apps/${APP}/.next/standalone/packages /app/modules/${MODULE}/apps/${APP}/.next/standalone/modules

# Stable entrypoint for distroless (no shell to expand MODULE/APP at runtime)
RUN ln -s "modules/${MODULE}/apps/${APP}/server.js" "/app/modules/${MODULE}/apps/${APP}/.next/standalone/server.js"


# # #
# RUNNER STAGE

FROM gcr.io/distroless/nodejs24-debian13 AS runner

ARG MODULE
ARG APP

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder --chown=nonroot:nonroot /app/assets ./modules/${MODULE}/apps/${APP}/public/assets
COPY --from=builder --chown=nonroot:nonroot /app/modules/${MODULE}/apps/${APP}/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot /app/modules/${MODULE}/apps/${APP}/.next/static ./modules/${MODULE}/apps/${APP}/.next/static

USER nonroot

# Distroless entrypoint is node; server.js is a symlink into the app path.
CMD ["server.js"]
