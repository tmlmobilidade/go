FROM node:24-alpine AS base

RUN npm install -g turbo@^2

FROM base AS installer

WORKDIR /app

# Copy package.json and packages first
COPY package.json ./
COPY packages ./packages
COPY turbo.json ./

# Generate package-lock.json
RUN npm install --package-lock-only

FROM base AS builder

WORKDIR /app

# Copy package files and generated lock file
COPY package.json ./
COPY packages ./packages
COPY turbo.json ./
COPY --from=installer /app/package-lock.json ./package-lock.json

# Install dependencies and build packages
RUN npm install
RUN turbo run build --filter=./packages/**/*