FROM node:24-alpine AS base

ENV MODULE=replicator
ENV APP=enrich

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

# Copy only the built app and dependencies,
# packages need to be included because node_modules symlinks to them.
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/modules/${MODULE}/apps/${APP}/dist/ .

CMD node src/index.js