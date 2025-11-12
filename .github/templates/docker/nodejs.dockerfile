FROM node:24-alpine AS base

ARG MODULE
ARG APP

ENV MODULE=${MODULE}
ENV APP=${APP}

RUN npm install -g turbo@^2

# # # # # # # # #


# # #
# PRUNER STAGE

FROM base AS pruner

ARG MODULE
ARG APP

WORKDIR /app

# Copy everything including package-lock.json from workflow cache
COPY . .

RUN turbo prune --scope=@tmlmobilidade/go-${MODULE}-${APP} --docker

# # # # # # # # #

# # #
# BUILDER STAGE

FROM base AS builder

ARG MODULE
ARG APP

WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=pruner /app/out/json/ .
RUN npm ci

# Build the app
COPY --from=pruner /app/out/full/ .
RUN turbo run build --filter=@tmlmobilidade/go-${MODULE}-${APP}

# # # # # # # # #

# # #
# RUNNER STAGE
FROM base AS runner

ARG MODULE
ARG APP

WORKDIR /app

# Copy only the built app and dependencies,
# packages need to be included because node_modules symlinks to them.
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/modules/${MODULE}/apps/${APP}/dist/ .

CMD ["node", "index.js"]