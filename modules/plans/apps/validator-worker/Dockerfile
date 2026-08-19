FROM golang:1.25-bookworm AS validator-builder

ARG TARGETARCH

WORKDIR /app

COPY modules/plans/apps/validator/src/go.mod modules/plans/apps/validator/src/go.sum ./modules/plans/apps/validator/src/
COPY packages-new/interfaces/validator-db/src/go.mod ./packages-new/interfaces/validator-db/src/go.mod
COPY packages-new/types/gtfs-validator/src/validation/go.mod ./packages-new/types/gtfs-validator/src/validation/go.mod

WORKDIR /app/modules/plans/apps/validator/src

RUN go mod download

WORKDIR /app

COPY modules/plans/apps/validator/src ./modules/plans/apps/validator/src
COPY packages-new/interfaces/validator-db/src ./packages-new/interfaces/validator-db/src
COPY packages-new/types/gtfs-validator/src/validation ./packages-new/types/gtfs-validator/src/validation

WORKDIR /app/modules/plans/apps/validator/src

RUN CGO_ENABLED=0 GOOS=linux GOARCH=${TARGETARCH} go build \
	-o /validator-bin/validator-linux-${TARGETARCH} \
	. \
	&& /validator-bin/validator-linux-${TARGETARCH} -version \
	&& sha256sum /validator-bin/validator-linux-${TARGETARCH}

FROM node:lts-slim AS base

ARG ENVIRONMENT

ENV ENVIRONMENT=${ENVIRONMENT}

RUN npm install -g turbo@^2

FROM base AS pruner

WORKDIR /app

COPY . .

RUN turbo prune --docker @tmlmobilidade/go-plans-validator-worker

FROM base AS builder

WORKDIR /app

RUN apt-get update \
	&& apt-get install -y python3 build-essential \
	&& rm -rf /var/lib/apt/lists/*

COPY --from=pruner /app/out/json/ .
COPY .github/templates/docker/scripts /app/.docker/scripts

RUN npm ci

COPY --from=pruner /app/out/full/ .
COPY --from=validator-builder /validator-bin ./bin

RUN npx @tmlmobilidade/repo-version --output=/app/modules/plans/apps/validator-worker/package.json
RUN turbo run build --filter=@tmlmobilidade/go-plans-validator-worker
RUN chmod +x /app/bin/validator-*
RUN npm prune
RUN node /app/.docker/scripts/trim-node-modules.js /app/node_modules
RUN node /app/.docker/scripts/trim-workspaces.js /app/packages /app/modules /app/packages-new

FROM gcr.io/distroless/nodejs24-debian13 AS runner

WORKDIR /app

ARG ENVIRONMENT
ARG TARGETARCH

ENV ENVIRONMENT=${ENVIRONMENT}
ENV GTFS_VALIDATOR_BIN_PATH=/app/bin/validator-linux-${TARGETARCH}
ENV NODE_ENV=production

COPY --from=builder /app/modules/plans/apps/validator-worker/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/packages-new ./packages-new
COPY --from=builder /app/modules ./modules
COPY --from=builder /app/bin ./bin
COPY --from=builder /app/modules/plans/apps/validator-worker/dist ./dist

CMD ["./dist/index.js"]
