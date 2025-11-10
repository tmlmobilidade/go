# # #
# DEFINE THE BASE IMAGE

FROM node:24-alpine AS base

ENV MODULE=controller
ENV APP=coordinator

RUN npm install -g turbo@^2


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


# # #
# RUNNER STAGE

FROM base AS runner

WORKDIR /app

COPY --from=builder /app .

CMD node apps/${APP}/dist/index.js