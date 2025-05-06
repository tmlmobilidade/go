# # # # # # # # #

FROM node:lts-alpine AS base

ENV MODULE=sae-plans
ENV PROJECT=frontend

ARG ENVIRONMENT
ENV ENVIRONMENT=${ENVIRONMENT}

RUN npm install -g turbo@^2

# # # # # # # # #


# # #
# PRUNER STAGE

FROM base AS pruner

RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app

COPY package.json ./
COPY . .

RUN turbo prune --scope=@tmlmobilidade/${MODULE}-${PROJECT} --docker


# # # # # # # # #


# PHASE 2
# Rebuild the source code only when needed.

FROM base AS builder

RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm install

# Build the project
COPY --from=pruner /app/out/full/ .
RUN turbo run build --filter=@tmlmobilidade/${MODULE}-${PROJECT}


# # # # # # # # #


# PHASE 3
# Setup the final Docker image with only the required files.

FROM base AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/${PROJECT}/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/${PROJECT}/.next/static ./apps/${PROJECT}/.next/static

CMD node /app/apps/${PROJECT}/server.js
