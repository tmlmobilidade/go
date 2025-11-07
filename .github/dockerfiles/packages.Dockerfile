FROM node:24-alpine AS base

RUN npm install -g turbo@^2

FROM base AS installer

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages ./packages

RUN npm install --package-lock-only

FROM base AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages ./packages
COPY turbo.json ./
COPY --from=installer /app/package-lock.json ./package-lock.json

RUN npm install
RUN turbo run build --filter=./packages/**/*