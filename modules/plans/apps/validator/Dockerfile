# # # # # # # # #

FROM node:20 AS base

ENV MODULE=sae-plans
ENV APP=validator

RUN npm install -g turbo@^2

# # # # # # # # #


# # #
# BUILDER STAGE

FROM base AS pruner

WORKDIR /app

COPY . .

RUN turbo prune --scope=@tmlmobilidade/${MODULE}-${APP} --docker


# # #
# INSTALLER STAGE

FROM base AS builder

WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=pruner /app/out/json/ .
RUN npm install

# Build the app
COPY --from=pruner /app/out/full/ .
RUN turbo run build --filter=@tmlmobilidade/${MODULE}-${APP}


# # #
# RUNNER STAGE

FROM base AS runner

WORKDIR /app

COPY --from=builder /app .

CMD node modules/${MODULE}/apps/${APP}/dist/src/index.js