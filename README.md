<p align="center">
  <img src="./assets/email/go-header-left.png" alt="GO" width="176" />
</p>

# GO — Gestor de Oferta

[![Production](https://img.shields.io/badge/go.tmlmobilidade.pt-live-0B6E4F?style=flat-square)](https://go.tmlmobilidade.pt)
[![Docs](https://img.shields.io/badge/Docs-reference-00a3ee?style=flat-square)](https://go.tmlmobilidade.pt/reference)
[![Node.js](https://img.shields.io/badge/Node.js-24+-3c873a?style=flat-square)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-AGPL--3.0-yellow?style=flat-square)](LICENSE)

[Overview](#overview) • [Features](#features) • [Architecture](#architecture) • [Getting started](#getting-started) • [Modules](#modules) • [Open data](#open-data) • [Resources](#resources)

GO is the operations control platform for [TML](https://www.tmlmobilidade.pt) and [Carris Metropolitana](https://www.carrismetropolitana.pt). It helps teams **design, operate, and analyse** public transport networks — from service offer and plans through real-time rides, alerts, and performance.

Built as a modular monorepo: use only the modules you need, or grow into the full stack over time.

> [!TIP]
> Business concepts, GTFS extensions, and public APIs are documented at [go.tmlmobilidade.pt/reference](https://go.tmlmobilidade.pt/reference).

## Overview

GO is a set of web apps and backend services that cover the main operational needs of public transport teams. The information flow is designed for continuous improvement at scale:

1. **Design** the service offer (lines, patterns, schedules)
2. **Publish** operational plans (GTFS)
3. **Operate** with real-time tracking, ticketing, and service alerts
4. **Analyse** ride compliance, punctuality, and demand

It was built for Carris Metropolitana but applies to any public transport operator. Modules are independent — for example, you can run real-time circulations without the offer module, or design lines and schedules without alerts.

## Features

- **Modular platform** — Domain modules (offer, plans, rides, alerts, performance, …) that can be adopted incrementally
- **GTFS-first** — Schedule and Realtime as the backbone; includes [TML’s GTFS extensions](https://go.tmlmobilidade.pt/reference/gtfs)
- **Real-time operations** — Vehicle positions, ride analysis (`rides`), ETA, and service alerts published as GTFS-RT
- **Ticketing integration** — APEX validations, on-board sales, refunds, and inspections
- **Open data** — Public Hub API used by TML’s own apps (same endpoints, same data, no privileged access)
- **Shared TypeScript stack** — Next.js frontends, Fastify APIs, MongoDB, Turborepo monorepo under `@tmlmobilidade/*`

## Architecture

```
go/
├── modules/          ← domain modules (apps, workers, helpers)
├── packages/         ← shared libraries (@tmlmobilidade/*)
├── packages-new/     ← newer shared packages (types, clients, interfaces)
├── cli/              ← operational CLI tools
├── infra/            ← infrastructure configuration
├── assets/           ← fonts, map tiles, email templates
└── scripts/          ← monorepo-level scripts
```

Built with **Turborepo** and **npm workspaces**. Each module is self-contained (API, frontend, workers, environments) and shares types, UI, and database interfaces via root packages.

```
modules/[module]/
├── apps/             ← api | frontend | workers | helpers
├── packages/         ← module-internal packages (optional)
├── environments/     ← per-env secrets (git-ignored)
└── helpers/          ← seed / migration utilities
```

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 24+
- [npm](https://www.npmjs.com/) 12+ (see `packageManager` in `package.json`)
- Access to module environment secrets (via the `env-sync` CLI or your team)

### Install

```bash
git clone https://github.com/tmlmobilidade/go.git
cd go
npm install
```

### Build shared packages

Shared packages must be built before running modules in development:

```bash
npm run build:packages
```

> [!IMPORTANT]
> Run `npm run build:packages` after pulling changes that touch `packages/` or `packages-new/`, before starting a module.

### Run a module

Auth is required for most UIs. Start it first, then the module you care about:

```bash
# Authentication (required by most frontends)
npm run dev:auth

# Example modules
npm run dev:offer
npm run dev:alerts
npm run dev:controller
npm run dev:plans
```

UI-only variants (API + frontend, no workers) are available for some modules:

```bash
npm run dev:alerts:ui
npm run dev:controller:ui
npm run dev:stops:ui
```

### Useful commands

| Command | Description |
| --- | --- |
| `npm run build` | Build the entire monorepo |
| `npm run build:packages` | Build shared packages and regenerate routes |
| `npm run build:<module>` | Build a single module (e.g. `build:alerts`) |
| `npm run dev:<module>` | Run a module in development |
| `npm run lint` | Lint all workspaces |
| `npm run rinse` | Clean `node_modules` and build artifacts |
| `npm run generate-routes` | Regenerate `PAGE_ROUTES` / `API_ROUTES` |

## Modules

| Module | Domain | Docs |
| --- | --- | --- |
| `auth` | Authentication, organisations, permissions | — |
| `offer` | Service offer — lines, routes, patterns, schedules, GTFS import/export | [Oferta](https://go.tmlmobilidade.pt/reference/go/offer) |
| `plans` | Operational plans — validation and publication | [Planos](https://go.tmlmobilidade.pt/reference/go/plans) |
| `controller` | Real-time rides — GTFS plans × GPS × APEX | [Circulações](https://go.tmlmobilidade.pt/reference/go/controller) |
| `alerts` | Service alerts → GTFS-RT Service Alerts | [Alertas](https://go.tmlmobilidade.pt/reference/go/alerts) |
| `performance` | KPIs — compliance, punctuality, demand | [Performance](https://go.tmlmobilidade.pt/reference/go/performance) |
| `tracker` | Vehicle event ingestion from operators | — |
| `apex` | APEX ticketing sync (validations, sales, refunds) | [APEX](https://go.tmlmobilidade.pt/reference/apex) |
| `eta` | Estimated time of arrival | — |
| `exporter` | GTFS and data export pipelines | — |
| `hub` | Public open-data API and Navegante integrations | [Open data](https://go.tmlmobilidade.pt/reference/open-data) |
| `stops` | Stop inventory and organisation | — |
| `fleet` | Vehicle fleet management | — |
| `locations` | Geographic boundaries (districts, municipalities, …) | — |
| `dates` | Operational calendar and date periods | — |
| `replicator` | Data replication from APEX and vehicle sources | — |

App naming follows `@tmlmobilidade/go-[module]-[app]` (e.g. `@tmlmobilidade/go-alerts-api`).

### Shared packages

Key packages most apps depend on:

| Package | Purpose |
| --- | --- |
| `@tmlmobilidade/types` | Types, DTOs, Zod schemas |
| `@tmlmobilidade/consts` | API/page routes, HTTP status codes |
| `@tmlmobilidade/interfaces` | Typed MongoDB collection accessors |
| `@tmlmobilidade/ui` | Shared React components and hooks |
| `@tmlmobilidade/fastify` | Fastify server, auth middleware |
| `@tmlmobilidade/utils` | `fetchData`, upload helpers, utilities |

## Open data

The Hub module exposes the same public APIs used by Carris Metropolitana and Navegante apps.

**Base URL:** `https://go.tmlmobilidade.pt/hub/api/:version/:path`

Examples:

| Path | Description |
| --- | --- |
| `/v1/alerts` | Service alerts (JSON) |
| `/v1/alerts/gtfs.pb` | Service alerts (GTFS-RT Protobuf) |
| `/v1/plans/gtfs` | Unified active GTFS for all operators |
| `/v1/network/stops` | Stops (JSON) |
| `/v1/realtime/vehicles/positions` | Live vehicle positions |
| `/v1/realtime/vehicles/positions/gtfs.pb` | Vehicle positions (GTFS-RT Protobuf) |

See the full catalogue and response format in the [open data reference](https://go.tmlmobilidade.pt/reference/open-data).

Related open resources:

- [carrismetropolitana/datasets](https://github.com/carrismetropolitana/datasets) — shared geographic and operational datasets
- [GTFS (TML)](https://go.tmlmobilidade.pt/reference/gtfs) — Schedule + Realtime and TML extensions

## Resources

- [GO reference docs](https://go.tmlmobilidade.pt/reference) — platform concepts and APIs
- [GO introduction](https://go.tmlmobilidade.pt/reference/go) — what GO is and how modules fit together
- [GTFS documentation](https://go.tmlmobilidade.pt/reference/gtfs) — Schedule, Realtime, TML extension
- [Open data / Hub API](https://go.tmlmobilidade.pt/reference/open-data) — public endpoints and versioning
- [TML on GitHub](https://github.com/tmlmobilidade) — other open-source projects

## Troubleshooting

**Module fails to start after a pull** — Rebuild packages: `npm run build:packages`.

**Missing environment variables** — Secrets live under `modules/[module]/environments/` and are not committed. Sync them with the `env-sync` CLI or ask your team for access.

**Route constants out of date** — After adding/renaming `page.tsx` or `*.routes.ts` files, run `npm run generate-routes` (also part of `build:packages`).

If you find a bug or have a question, [open an issue](https://github.com/tmlmobilidade/go/issues) or see [how to report bugs](https://go.tmlmobilidade.pt/reference/bugs).
