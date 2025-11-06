FROM node:24-alpine AS base

ENV MODULE=...
ENV APP=...

RUN npm install -g turbo@^2

# # # # # # # # #


# # #
# INSTALLER STAGE

FROM base AS installer

WORKDIR /app

COPY . .

RUN npm install --package-lock-only


# # #
# PRUNER STAGE

FROM base AS pruner

WORKDIR /app

COPY . .
COPY --from=installer /app/package-lock.json ./package-lock.json

RUN turbo prune --scope=@tmlmobilidade/go-${MODULE}-${APP} --docker

# # # # # # # # #

# # #
# BUILDER STAGE

FROM base AS builder

WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=pruner /app/out/json/ .
RUN npm install

# Build the app
COPY --from=pruner /app/out/full/ .
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

COPY --from=builder --chown=nextjs:nodejs /app/modules/${MODULE}/apps/${APP}/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/modules/${MODULE}/apps/${APP}/.next/static ./modules/${MODULE}/apps/${APP}/.next/static

CMD node /app/modules/${MODULE}/apps/${APP}/server.js
