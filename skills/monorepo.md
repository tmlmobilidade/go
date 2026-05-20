# Skill: Monorepo — GO Structure

Overview of the GO monorepo: how it's organised, how the build system works, and how to navigate and extend it. Load after the `tml-context` skill for business context.

---

## Top-level layout

```
go/
├── modules/          ← domain modules (each is a self-contained microservice group)
├── packages/         ← shared packages used across all modules
├── cli/              ← CLI tools (scripts, data ops, maintenance)
├── infra/            ← infrastructure configuration
├── assets/           ← global assets (fonts, map tiles, email templates)
└── scripts/          ← monorepo-level shell scripts
```

Built with **Turborepo** + **npm workspaces**. The workspace glob covers all apps and packages:

```json
"workspaces": ["modules/**/*", "packages/**/*", "cli/*"]
```

All packages use the `@tmlmobilidade/` scope.

---

## Modules

Each module represents a domain area of the GO platform. A module is self-contained: it owns its apps, its environments, and optionally its own internal packages.

### Current modules

| Module | Domain |
|---|---|
| `alerts` | Service alerts — creation, publication, external sync |
| `apex` | APEX ticketing system integration — validations, sales, refunds |
| `auth` | Authentication, organisations, permissions |
| `controller` | Real-time ride tracking — feeders, examiners, bridge, API |
| `dates` | Operational calendar and date period management |
| `eta` | Estimated time of arrival computation |
| `exporter` | GTFS and data export pipeline |
| `fleet` | Vehicle fleet management |
| `hub` | Central data hub — GTFS sync, Navegante app integration |
| `locations` | Geographic locations and GeoJSON management |
| `offer` | Service offer — lines, routes, schedules, GTFS import/export |
| `performance` | KPI metrics — trip compliance, punctuality, reporting |
| `plans` | Operational and offer plans — validation, publication |
| `replicator` | Data replication from APEX and vehicle event sources |
| `stops` | Stop management and organisation |
| `tracker` | Real-time vehicle tracking — event ingestion from operators |

### Module anatomy

```
modules/[module]/
├── apps/
│   ├── api/              ← Fastify HTTP API
│   ├── frontend/         ← Next.js frontend (if user-facing)
│   ├── [worker]/         ← background workers, sync jobs, stream processors
│   └── [helper]/         ← one-off scripts (seed, migrate, export)
├── packages/             ← internal packages (only used within this module)
│   └── [name]/           ← @tmlmobilidade/go-[module]-pckg-[name]
├── environments/         ← per-environment secret files (never committed)
└── helpers/              ← seed scripts, data migration utilities
```

Not every module has all of these. `auth` has no internal packages. `tracker` has no frontend. Add only what's needed.

### App naming

Apps inside a module follow the pattern `@tmlmobilidade/go-[module]-[app]`:

```
@tmlmobilidade/go-alerts-api
@tmlmobilidade/go-alerts-frontend
@tmlmobilidade/go-alerts-organizer
@tmlmobilidade/go-controller-rides-feeder
@tmlmobilidade/go-controller-rides-examiner
```

Module-internal packages follow `@tmlmobilidade/go-[module]-pckg-[name]`:

```
@tmlmobilidade/go-alerts-pckg-describe
@tmlmobilidade/go-alerts-pckg-organize
@tmlmobilidade/go-stops-pckg-organize
@tmlmobilidade/go-tracker-pckg-parsers
```

---

## Shared packages

Root-level packages live in `packages/` and are available to all modules. They are published under `@tmlmobilidade/[name]`. See `go/skills/packages.md` for the full reference.

Key packages most apps depend on:

| Package | Purpose |
|---|---|
| `@tmlmobilidade/types` | All TypeScript types, DTOs, Zod schemas |
| `@tmlmobilidade/consts` | API routes, page routes, HTTP status codes |
| `@tmlmobilidade/interfaces` | MongoDB collection methods |
| `@tmlmobilidade/ui` | React components, hooks, auth context |
| `@tmlmobilidade/fastify` | Fastify server, request/reply types, auth middleware |
| `@tmlmobilidade/utils` | fetchData, uploadFile, general utilities |

---

## CLI tools

Operational scripts that run outside the module runtime:

| CLI | Purpose |
|---|---|
| `backupd` | Database backup daemon |
| `env-sync` | Syncs environment secrets to/from MongoDB |
| `export-data` | Data export utility |
| `generate-offer-files` | Generates GTFS offer files from source data |
| `generate-routes` | Generates route definitions for the monorepo |
| `repo-rinse` | Cleans `node_modules` and build artifacts across the repo |
| `repo-version` | Manages package versioning |

---

## Build system

Turborepo orchestrates builds, with task pipelines defined in `turbo.json`. Each package/app has its own `package.json` with `build`, `dev`, `lint` scripts.

### Building

```bash
# Build everything
npm run build

# Build a specific module (example: alerts)
npm run build:alerts

# Build only packages (run this before developing a module)
npm run build:packages

# Build a specific package
npm run build:types
npm run build:eslint
```

Always run `npm run build:packages` after pulling changes that touch shared packages, before running a module in dev mode.

### Running in development

```bash
# Run a full module (api + frontend + workers)
npm run dev:alerts
npm run dev:controller
npm run dev:offer

# Run only the UI (api + frontend) for a module
npm run dev:alerts:ui
npm run dev:controller:ui

# Run against production data (use with care)
npm run dev:alerts:prd
```

### Other useful commands

```bash
# Lint everything
npm run lint
npm run lint:fix

# Clean all build artifacts and node_modules
npm run rinse
```

---

## Adding a new module

1. Create `modules/[module]/` following the anatomy above
2. Add `apps/api/` with `src/main.ts`, `src/index.ts`, and `src/endpoints/`
3. Add `apps/frontend/` with the standard Next.js + `@tmlmobilidade/ui` structure
4. Add environment files to `modules/[module]/environments/`
5. Add build/dev scripts to the root `package.json` following the existing naming convention
6. Register any new types in `packages/types/src/[domain]/`
7. Register any new collection interfaces in `packages/interfaces/`
8. Add module scope and actions to `PermissionCatalog` in `packages/types`
9. Add module scope to `commitlint.config.cjs` in the repo root

---

## Environments

Each module manages its own environment files:

```
modules/[module]/environments/
├── development/secrets/.env
├── staging/secrets/.env
└── production/secrets/.env
```

These files are git-ignored. The `env-sync` CLI manages syncing them. Never hardcode secrets or commit `.env` files.

The `ENVIRONMENT` variable controls which env file is loaded at runtime. The root dev scripts set this automatically.

---

## TypeScript

All apps and packages extend from `@tmlmobilidade/tsconfig`. Each app's `tsconfig.json` looks like:

```json
{
  "extends": "@tmlmobilidade/tsconfig/[base|nextjs|node].json",
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

Path aliases: `@/` maps to `src/` in every app. Use `@/` for all internal imports — never use relative paths with `../`.

---

## ESLint

All apps and packages extend `@tmlmobilidade/eslint`. Run `npm run lint` from the repo root to lint everything, or `turbo lint --filter=@tmlmobilidade/go-alerts-*` for a specific module.

---

## Route generation

`PAGE_ROUTES` and `API_ROUTES` in `@tmlmobilidade/consts` are **fully auto-generated**. Never edit `packages/consts/src/app-routes.ts` manually — all changes will be overwritten on the next build.

### How it works

The script `scripts/generate-routes.sh` scans the monorepo and writes `packages/consts/src/app-routes.ts`:

- **Frontend routes (`PAGE_ROUTES`):** scans every `page.tsx` under `modules/[module]/apps/frontend/src/app/`. Route groups like `(authenticated)` are stripped. Dynamic segments like `[id]` become `${id}` in a typed function. List routes get a `_LIST` suffix, detail routes get `_DETAIL` suffix.
- **API routes (`API_ROUTES`):** scans every `*.routes.ts` under `modules/[module]/apps/api/src/endpoints/`. It reads the `namespace` constant and the `instance.get/post/put/delete` paths from each file. Routes with path variables become typed functions.

Both route sets are wrapped in `getModuleConfig(module, 'frontend_url' | 'api_url')` so they resolve to the correct base URL per environment.

### Triggering regeneration

```bash
# Runs automatically as part of package builds:
npm run build:packages

# Or run standalone:
npm run generate-routes
```

Run this any time you add, rename, or remove a `page.tsx` or `*.routes.ts` file so the constants stay in sync.

### Adding routes

- **New frontend page:** create the `page.tsx` file in the correct App Router path, then run `npm run generate-routes`. The new `PAGE_ROUTES` key appears automatically.
- **New API endpoint:** create the `*.routes.ts` file with a `namespace` constant and `instance.METHOD` calls, then run `npm run generate-routes`. The new `API_ROUTES` key appears automatically.

### Using generated routes

```ts
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';

// Frontend navigation
router.push(PAGE_ROUTES.alerts.ALERTS_LIST);
router.push(PAGE_ROUTES.alerts.ALERTS_DETAIL(alertId));

// SWR data fetching
useSWR(API_ROUTES.alerts.ALERTS_DETAIL(alertId));

// Mutations
fetchData(API_ROUTES.alerts.ALERTS_DETAIL(alertId), 'PUT', body);
```
