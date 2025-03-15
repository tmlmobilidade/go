# # # # # # # # #

FROM node:22.6-alpine3.20 AS base

ENV MODULE=controller
ENV SCOPE=explorer
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

RUN turbo prune --scope=@tmlmobilidade/sae-${MODULE}-${SCOPE}-${PROJECT} --docker


# # # # # # # # #


# PHASE 2
# Rebuild the source code only when needed.

FROM base AS builder

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN npx @helperkits/bumper bump

RUN npm run build


# # # # # # # # #


# PHASE 3
# Setup the final Docker image with only the required files.

FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]