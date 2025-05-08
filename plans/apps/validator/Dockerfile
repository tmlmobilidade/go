# # # # # # # # #

FROM node:20-bullseye AS base

ENV MODULE=sae-plans
ENV PROJECT=validator

RUN npm install -g turbo@^2

# # # # # # # # #


# # #
# BUILDER STAGE

FROM base AS pruner

WORKDIR /app

COPY . .

RUN turbo prune --scope=@tmlmobilidade/${MODULE}-${PROJECT} --docker


# # #
# INSTALLER STAGE

FROM base AS builder

WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=pruner /app/out/json/ .
RUN npm install

# Build the project
COPY --from=pruner /app/out/full/ .
RUN turbo run build --filter=@tmlmobilidade/${MODULE}-${PROJECT}


# # #
# RUNNER STAGE

FROM base AS runner

WORKDIR /app

COPY --from=builder /app .

CMD node apps/${PROJECT}/dist/src/index.js