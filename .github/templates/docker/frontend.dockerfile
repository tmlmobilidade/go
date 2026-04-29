# # #

FROM node:lts-alpine AS base


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

RUN turbo prune --scope=@tmlmobilidade/go-${MODULE}-${APP} --docker


# # #
# BUILDER STAGE

FROM base AS builder

ARG MODULE
ARG APP

WORKDIR /app

COPY .github/templates/docker/scripts /app/.docker/scripts

# First install the dependencies (as they change less often)
COPY --from=pruner /app/out/json/ .
RUN npm ci

# Build the app
COPY --from=pruner /app/out/full/ .

RUN npx @tmlmobilidade/repo-version --output=/app/modules/${MODULE}/apps/${APP}/package.json

RUN turbo run build --filter=@tmlmobilidade/go-${MODULE}-${APP}

RUN node /app/.docker/scripts/trim-node-modules.js /app/modules/${MODULE}/apps/${APP}/.next/standalone/node_modules
RUN node /app/.docker/scripts/trim-workspaces.js /app/modules/${MODULE}/apps/${APP}/.next/standalone/packages /app/modules/${MODULE}/apps/${APP}/.next/standalone/modules


# # #
# RUNNER STAGE

FROM base AS runner

ARG MODULE
ARG APP

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=pruner --chown=nextjs:nodejs /app/assets ./modules/${MODULE}/apps/${APP}/public
COPY --from=builder --chown=nextjs:nodejs /app/modules/${MODULE}/apps/${APP}/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/modules/${MODULE}/apps/${APP}/.next/static ./modules/${MODULE}/apps/${APP}/.next/static

CMD node /app/modules/${MODULE}/apps/${APP}/server.js
