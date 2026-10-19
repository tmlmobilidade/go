---
name: go-architecture
description: GO monorepo architecture. Load when deciding where new code belongs (shared package, module package, or app), adding a module, an app or a package, wiring a worker, tracing a dependency between modules and packages, or running or building part of the repo.
---

Reference: the filesystem is the source of truth. `find modules/*/apps/* -maxdepth 0` lists every deployable; `packages-new/*/*` and `packages/*` list every shared library. This file caches the rules that the tree alone cannot show. Frontend and API app internals live in the `go-frontend` and `go-api` skills.

## Three layers, one direction

```
modules/<module>/apps/<app>          @tmlmobilidade/go-<module>-<app>        deployable
        ↓ may import
modules/<module>/packages/<name>     @tmlmobilidade/go-<module>-pckg-<name>  module-internal library
        ↓ may import
packages-new/<kind>/<name>           @tmlmobilidade/go-<kind>-<name>         shared library
packages/<name>                      @tmlmobilidade/<name>                   shared library (older tier)
```

Imports flow downward only. An app imports module packages and shared packages. A module package imports shared packages. A shared package imports other shared packages. Nothing imports an app, and nothing outside a module imports that module's packages: no module package is used by another module today, and that stays true.

Two modules talk through three channels: a shared package (a type in `packages-new/types/<domain>`, a client, a provider), the database (`goDb` collections), or HTTP (`API_ROUTES`). A module that needs another module's logic asks for it to be lifted into `packages-new`.

## Shared packages

`packages-new/<kind>/<name>` is the current tier, organised by kind:

| Kind | Holds | Examples |
|---|---|---|
| `types` | entities, DTOs, Zod schemas, enums per domain | `go-types-core`, `go-types-operation`, `go-types-shared`, `go-types-permissions`, `go-types-gtfs` |
| `clients` | connections to one external system | `go-clients-fastify`, `go-clients-mongo`, `go-clients-clickhouse`, `go-clients-rabbitmq`, `go-clients-redis`, `go-clients-oci-storage` |
| `interfaces` | typed data access on top of a client | `go-interfaces-godb` (GO's MongoDB, one class per module database), `go-interfaces-labdb` (ClickHouse analytics), `go-interfaces-rawdb`, `go-interfaces-cachedb` |
| `providers` | a service composed from clients and interfaces | `go-providers-auth`, `go-providers-emails`, `go-providers-storage`, `go-providers-ai` |
| `utils` | pure helpers, no I/O | `go-utils-dates`, `go-utils-exec`, `go-utils-sql`, `go-utils-zip`, `go-utils-tsconfig` |
| `extractions` | extraction task implementations run by the extractions worker | `go-extractions-offer-gtfs` |

`packages/<name>` is the older tier. Part of it is still the home for current code: `consts` (module config, generated routes, HTTP status), `ui` (the component library, the only place `@mantine/*` is imported), `eslint`, `logger`, `timer`, `strings`, `utils`, `math`, `geo`, `gtfs-rt`. Part of it is legacy with a `packages-new` successor: `types` → `go-types-*`, `interfaces` and `mongo` → `go-interfaces-godb` on `go-clients-mongo`, `controllers` and `writers` → module packages and `go-utils-exec`. New code depends on the successor; `performance` and `exporter` still carry the legacy dependencies and migrate when touched.

Shared packages are published to npm from the `publish-packages` workflow and consumed inside the repo through workspaces with `"*"` versions.

## Modules

A module is a domain area: `apex`, `core`, `dates`, `exporter`, `hub`, `infrastructure`, `locations`, `offer`, `operation`, `performance`, `tracker`. Older names still appear in `commitlint.config.cjs` and the README (`auth` lives in `core`; `alerts`, `plans`, `controller` live in `operation`; `stops` lives in `infrastructure`).

```
modules/<module>/
├── apps/         ← one folder per deployable
├── packages/     ← optional: types, utils, and other libraries shared by this module's apps
└── sql/          ← optional: ClickHouse queries read through sqlPath() from go-utils-sql
```

A module is registered in four places outside its folder:

1. `packages/consts/src/app-configs.ts` `MODULE_CONFIGS`: ports, URLs and CORS per environment, read through `getModuleConfig(module, key)`.
2. `packages-new/interfaces/godb/src/databases/<module>.ts`: its MongoDB database and collections.
3. `PermissionCatalog` in `go-types-permissions`: its scopes and actions.
4. Root `package.json`: `build:<module>`, `dev:<module>`, `dev:<module>:ui`, `dev:<module>:<app>` scripts, plus a `commitlint` scope.

Module packages carry what only this module's apps share: `types` for list items and filter DTOs that the API produces and the frontend consumes, `utils` for helpers shared by its workers. A type needed by a second module moves up to `packages-new/types/<domain>`.

## Three kinds of app

Every app is `@tmlmobilidade/go-<module>-<app>` with `"type": "module"`, `build`, `dev` and `lint` scripts, a `tsconfig.json` extending `@tmlmobilidade/go-utils-tsconfig/<nodejs|nextjs>.json` with the `@/*` alias, and an `eslint.config.mjs` spreading `node` or `next` from `@tmlmobilidade/eslint`. Relative imports end in `.js`.

| Kind | Folder | Runtime | Served at | Skill |
|---|---|---|---|---|
| frontend | `apps/frontend` (or `frontend-<name>`) | Next.js, `basePath: /<module>`, `frontend_port` | `<host>/<module>` | `go-frontend` |
| api | `apps/api` | Fastify through `FastifyService`, `api_port` | `<host>/<module>/api` | `go-api` |
| worker | `apps/<subject>-<verb>` | plain Node process, `tsx watch src/index.ts` in dev, `node dist/index.js` in prod | no public URL | this file |

### Workers

A worker is any app that is neither the frontend nor the API. Its name says what it acts on and how: `rides-sync`, `rides-feeder`, `extractions-worker`, `publish-gtfs`, `sync-metrics-daily`, `organizer`. Tracker apps add the operator: `pt-tml-cm-core-stream`.

```
src/
├── index.ts        ← main(), then the run mode
├── tasks/          ← one file per unit of work (sync-rides.ts)
├── handlers/       ← coordinators only: one file per HTTP handler
└── utils/          ← app-local helpers
```

`index.ts` opens by defining `main()` and picks a run mode from `@tmlmobilidade/go-utils-exec`:

- **Interval**: `await runOnInterval(main, { intervalMs })`. The common shape for cleaners, feeders, examiners, publishers and organizers.
- **Batch**: `main()` walks a range with `performInTimeChunks` or `performInChunks` and exits. Used for backfills and syncs.
- **Coordinator and worker pair**: the coordinator is a bare `Fastify()` on port 5050 whose handlers hand out the next unit of work; workers poll it, call `startHeartbeat` while processing, and write results back through `goDb`. See `core/apps/extractions-coordinator` and `extractions-worker`.
- **Stream**: a long-lived consumer on `go-clients-rabbitmq` or a database change stream (`*-stream` apps).

Inside `main()`, a `Timer` from `@tmlmobilidade/timer` measures the run and `Logger.title` / `Logger.info` / `Logger.terminate` report it. Data access goes through `goDb` or `labDb`; module-specific helpers come from the module's `packages/utils`.

## Build, run, deploy

- **Turborepo** with `build` depending on `^build`, so packages build before apps. Apps resolve workspace packages from `dist`: after editing a package, rebuild it (`turbo run build --filter=<package>` or `npm run build:<module>:pckg`) before the app sees the change.
- `npm run repo:init` installs, links assets, builds every package and generates routes. `npm run dev:<module>:ui` runs the API and frontend of one module; `npm run dev:<module>:<app>` runs one worker. Every dev script wraps `repo:load-env-stg`, which loads `environments/stg/.env.stg` with `ENVIRONMENT=dev`.
- **Routes are generated.** `packages/consts/src/app-routes.ts` is written by `npm run repo:routes` (`scripts/generate-routes.sh`) from every `page.tsx` under a frontend's `src/app` and every `routes.ts` under an API's `src/endpoints`, using each file's `NAMESPACE`. Add the page or route file, run the script, and the `PAGE_ROUTES` / `API_ROUTES` key appears.
- **Deployment** is one container per app. CI discovers `modules/*/apps/*`, runs `turbo prune --docker` for `@tmlmobilidade/go-<module>-<app>`, and builds `ghcr.io/tmlmobilidade/go-<module>-<app>`. Apps whose folder starts with `frontend` use `.github/templates/docker/frontend.dockerfile`; every other app uses `nodejs.dockerfile`; an app-local `Dockerfile` overrides both. The container receives `ENVIRONMENT`, `MODULE` and `APP`.

## Where new code goes

| Need | Location |
|---|---|
| Entity, DTO or schema used by more than one module | `packages-new/types/<domain>` |
| List item or filter DTO for one module's API and frontend | `modules/<module>/packages/types` |
| Helper shared by several apps of one module | `modules/<module>/packages/utils` |
| Pure helper shared across modules | `packages-new/utils/<name>` |
| Service composed from clients (email, storage, auth) | `packages-new/providers/<name>` |
| Connection to a new external system | `packages-new/clients/<name>`, typed access in `packages-new/interfaces/<name>` |
| New MongoDB collection | `packages-new/interfaces/godb/src/databases/<module>.ts` |
| Background job | new worker in `modules/<module>/apps/<subject>-<verb>` plus a `dev:<module>:<app>` script |
| UI component reused across frontends | `packages/ui` |
| Constant referenced by more than one app | `packages/consts` |

## Do not

- **No import across modules.** Code needed by two modules lifts into `packages-new`; data crosses through `goDb` or `API_ROUTES`.
- **No app importing another app**, including the same module's API from a worker. Shared logic goes to the module's `packages/`.
- **No shared package depending on a module**, and no Node package depending on `@tmlmobilidade/ui`.
- **No hand edits to `packages/consts/src/app-routes.ts`.** Run `npm run repo:routes`.
- **No new dependency on `@tmlmobilidade/types`, `interfaces`, `mongo`, `controllers` or `writers`.** Use the `go-types-*`, `go-interfaces-godb` and `go-utils-exec` successors.
- **No `@mantine/*` outside `packages/ui`**, no `fastify` outside `go-clients-fastify` except a coordinator's internal server.
- **No hardcoded ports, hosts or URLs.** `getModuleConfig(module, key)` and the generated routes resolve them per environment.
- **No secrets or `.env` files in code or git.** Runtime configuration comes from `environments/<env>/` through the dev scripts, and from the container environment in deployment.
- **No relative imports that climb out of `src`.** A workspace package is imported by its name.
- **No worker without a run mode from `go-utils-exec`.** Every deployable reports the same way.
