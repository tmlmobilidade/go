# # #
# DEFINE THE BASE IMAGE

FROM node:24-alpine AS base

ENV MODULE=controller
ENV PROJECT=sams-examiner

RUN npm install -g turbo@^2


# # #
# BUILDER STAGE

FROM base AS pruner

WORKDIR /app

COPY . .

RUN turbo prune --scope=@tmlmobilidade/go-${MODULE}-${PROJECT} --docker


# # #
# INSTALLER STAGE

FROM base AS builder

WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=pruner /app/out/json/ .
RUN npm install

# Build the project
COPY --from=pruner /app/out/full/ .
RUN turbo run build --filter=@tmlmobilidade/go-${MODULE}-${PROJECT}


# # #
# RUNNER STAGE

FROM base AS runner

WORKDIR /app

COPY --from=builder /app .

CMD node apps/${PROJECT}/dist/index.js