# # #

FROM node:24-alpine AS base

ARG MODULE
ARG APP

ENV MODULE=${MODULE}
ENV APP=${APP}

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

FROM base AS builder

WORKDIR /app

COPY --from=pruner /app/out/json/ .
RUN npm ci

COPY --from=pruner /app/out/full/ .
RUN turbo run build --filter=@tmlmobilidade/go-${MODULE}-${APP}


# # #
# RUNNER STAGE
# Copy only the built app and dependencies,
# packages need to be included because node_modules symlinks to them.

FROM base AS runner

WORKDIR /app

# COPY --from=builder /app/packages ./packages
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/modules/${MODULE}/apps/${APP}/dist/ .

# CMD ["node", "index.js"]

COPY --from=builder /app .

CMD ["node", "modules/${MODULE}/apps/${APP}/dist/index.js"]