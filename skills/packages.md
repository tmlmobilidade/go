# Skill: Packages — GO Shared Packages

Reference for the shared packages in `go/packages/`. These are published under the `@tmlmobilidade/` scope and used across all modules and apps in the GO monorepo.

When adding a new utility, type, component, or integration — check here first before writing it locally. If it belongs to an existing package, add it there. If it doesn't fit anywhere, discuss before creating a new package.

---

## Package naming

| Pattern | Meaning |
|---|---|
| `@tmlmobilidade/[name]` | Root-level shared package (`packages/[name]`) |
| `@tmlmobilidade/go-[module]-[app]` | Module app (e.g. `go-alerts-api`, `go-alerts-frontend`) |
| `@tmlmobilidade/go-[module]-pckg-[name]` | Module-internal package (e.g. `go-alerts-pckg-describe`) |

---

## Core packages

### `@tmlmobilidade/types`
**All TypeScript types, DTOs, Zod schemas, and enums for GO.**

This is the single source of truth for data shapes. Every domain entity type, API request/response type, and validation schema lives here.

```ts
import {
  type Alert,
  type CreateAlertDto,
  CreateAlertSchema,
  type UpdateAlertDto,
  UpdateAlertSchema,
  PermissionCatalog,
} from '@tmlmobilidade/types';
```

Structure: `src/[domain]/` — e.g. `src/alerts/`, `src/rides/`, `src/gtfs/`.

Use this for: all type imports. Never define entity types locally in a module.

---

### `@tmlmobilidade/consts`
**Shared constants: API routes, page routes, HTTP status codes, and other app-wide values.**

```ts
import { API_ROUTES, HTTP_STATUS, HttpException, PAGE_ROUTES } from '@tmlmobilidade/consts';

// API routes (used in both frontend SWR keys and backend route handlers)
API_ROUTES.alerts.ALERTS_LIST
API_ROUTES.alerts.ALERTS_DETAIL(id)
API_ROUTES.alerts.ALERTS_DETAIL_IMAGE(id)
API_ROUTES.alerts.ALERTS_DETAIL_LOCK(id)

// Page routes (used in frontend navigation)
PAGE_ROUTES.alerts.ALERTS_LIST
PAGE_ROUTES.alerts.ALERTS_DETAIL(id)

// HTTP status codes
HTTP_STATUS.OK          // 200
HTTP_STATUS.CREATED     // 201
HTTP_STATUS.BAD_REQUEST // 400
HTTP_STATUS.NOT_FOUND   // 404

// Error class for Fastify
throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Not found');
```

Use this for: any constant that is referenced from more than one app. Never hardcode API paths or status codes.

---

### `@tmlmobilidade/interfaces`
**MongoDB collection interfaces — typed methods for reading and writing to every collection.**

```ts
import { alerts, files, lines, stops } from '@tmlmobilidade/interfaces';

await alerts.findById(id);
await alerts.findMany({ agency_id: 'xxx' }, { sort: { created_at: -1 } });
await alerts.insertOne(data);
await alerts.updateById(id, partialData);
await alerts.deleteById(id);
await alerts.toggleLockById(id);
```

Use this for: all database access in API controllers. Never write raw MongoDB queries in a module — add the method here instead.

---

### `@tmlmobilidade/ui`
**All shared React components, hooks, contexts, and utilities for GO frontends.**

This is the component library for all GO module UIs. Built on top of Mantine.

Key exports:

```ts
// Layout components
import { ComponentWrapper, ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

// Action buttons
import { DeleteButton, DuplicateButton, LockButton, SaveButton } from '@tmlmobilidade/ui';

// Form utilities
import { useContextForm } from '@tmlmobilidade/ui';

// Data hooks
import { useDataAgencies, useDataLines, useDataStops } from '@tmlmobilidade/ui';

// Auth / permissions
import { useMeContext } from '@tmlmobilidade/ui';

// Flag hooks
import {
  useFlagCanDelete,
  useFlagCanDuplicate,
  useFlagCanLock,
  useFlagCanSave,
  useFlagReadOnly,
} from '@tmlmobilidade/ui';

// Context utilities
import { useHandleUpdate } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';

// Types
import { type DetailContextStateTemplate } from '@tmlmobilidade/ui';
```

Use this for: all UI in GO module frontends. Do not import from Mantine directly.

---

### `@tmlmobilidade/fastify`
**Fastify server setup, typed request/reply, and auth middleware for GO API apps.**

```ts
import {
  authorizationMiddleware,
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
  FastifyService,
} from '@tmlmobilidade/fastify';

// Get the singleton server instance
const server: FastifyInstance = FastifyService.getInstance().server;

// Typed request (request.me and request.permissions are available after auth)
static async handler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Resource>) { ... }

// Auth middleware
{ preHandler: authorizationMiddleware(scope, [actions]) }
```

Use this for: all Fastify API apps. Never bootstrap a Fastify server directly.

---

### `@tmlmobilidade/utils`
**General-purpose utilities for both frontend and backend.**

```ts
import { fetchData, uploadFile } from '@tmlmobilidade/utils';

// Typed API fetch (used in frontend mutations)
const result = await fetchData<Alert>(API_ROUTES.alerts.ALERTS_DETAIL(id), 'PUT', body);

// File upload
await uploadFile(API_ROUTES.alerts.ALERTS_DETAIL_IMAGE(id), file);
```

Also contains batching, caching, generic object/array utilities. Check `packages/utils/src/` before writing a utility function locally.

---

## Infrastructure packages

### `@tmlmobilidade/databases`
Typed database client definitions and interfaces. Used internally by `@tmlmobilidade/mongo` and other database packages.

### `@tmlmobilidade/mongo`
MongoDB client with connection pooling and helpers. Used by `@tmlmobilidade/interfaces` — you rarely import this directly.

### `@tmlmobilidade/rabbitmq`
RabbitMQ client for inter-service messaging. Used in worker apps that consume or publish events.

### `@tmlmobilidade/fastify`
See above — covers all Fastify server setup.

---

## Domain packages

### `@tmlmobilidade/dates`
Date utilities for operational calendar logic, period management, and GTFS date handling.

### `@tmlmobilidade/geo`
Geographic utilities: coordinate transforms, distance calculation, GeoJSON helpers.

### `@tmlmobilidade/gtfs-rt`
GTFS Realtime encoding/decoding utilities. Used by tracker and exporter apps.

### `@tmlmobilidade/import-gtfs`
GTFS Schedule import processors. Used by offer module importers.

### `@tmlmobilidade/normalizers`
Data normalisation utilities for transforming raw external data into GO internal formats.

### `@tmlmobilidade/controllers`
Higher-level operation controllers for agencies, rides, and exporter logic. Used by worker apps.

### `@tmlmobilidade/writers`
Typed write helpers for bulk database operations.

---

## Developer tooling packages

### `@tmlmobilidade/eslint`
Shared ESLint config. Extended by all apps and packages in the monorepo.

### `@tmlmobilidade/tsconfig`
Shared TypeScript configs. Extended by `tsconfig.json` in every package.

---

## Email and messaging

### `@tmlmobilidade/emails`
React Email templates for transactional emails. Contains components, styles, and rendered templates.

### `@tmlmobilidade/rss`
RSS feed utilities for generating and parsing feeds.

---

## Utilities

### `@tmlmobilidade/strings`
String manipulation helpers (normalisation, slugification, etc.).

### `@tmlmobilidade/math`
Numeric/statistical utilities.

### `@tmlmobilidade/logger`
Structured logging. Use this instead of `console.log` in production services.

### `@tmlmobilidade/timer`
Timer and interval utilities for scheduled tasks.

### `@tmlmobilidade/files`
File system utilities (reading, writing, path helpers).

### `@tmlmobilidade/ssh`
SSH connection utilities for remote operations.

### `@tmlmobilidade/sqlite`
SQLite client for local data storage in CLI tools.

### `@tmlmobilidade/ai`
AI utilities (prompt helpers, structured output, etc.) for AI-powered features in GO.
