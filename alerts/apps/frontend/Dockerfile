# # # # # # # # #

FROM node:22.6-alpine3.20 AS base

ENV MODULE=alerts
ENV PROJECT=frontend

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

RUN turbo prune --scope=@tmlmobilidade/sae-${MODULE}-${PROJECT} --docker


# # # # # # # # #


# PHASE 2
# Rebuild the source code only when needed.

FROM base AS builder

RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app

ARG NEXT_PUBLIC_URL
ENV NEXT_PUBLIC_URL=${NEXT_PUBLIC_URL}
ARG NEXT_PUBLIC_AUTH_URL
ENV NEXT_PUBLIC_AUTH_URL=${NEXT_PUBLIC_AUTH_URL}

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm install

# Build the project
COPY --from=pruner /app/out/full/ .
RUN turbo run build --filter=@tmlmobilidade/sae-${MODULE}-${PROJECT}


# # # # # # # # #


# PHASE 3
# Setup the final Docker image with only the required files.

FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/${PROJECT}/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/${PROJECT}/.next/static ./apps/${PROJECT}/.next/static

CMD node /app/apps/${PROJECT}/server.js
