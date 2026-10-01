---
name: go-api
description: GO module API conventions (modules/*/apps/api). Load when adding or editing an endpoint namespace, a routes.ts file, a handler under handlers/, or the types, DB collection or route constant a new endpoint needs in any GO API app.
---

Reference: `modules/core/apps/api/src/endpoints/agencies` is the canonical namespace. `routes.ts` registers; each handler in `handlers/` does one thing. When a rule here and the exemplar disagree, the exemplar wins: open it.

## Where things live

```
src/
├── index.ts                     ← imports './main.js' then './endpoints/index.js'
├── main.ts                      ← FastifyService.getInstance({ module, origin, port }) and start()
└── endpoints/
    ├── index.ts                 ← side-effect import of every '<namespace>/routes.js'
    └── <namespace>/
        ├── routes.ts
        └── handlers/
            ├── list-<entities>.ts
            ├── get-<entity>.ts
            ├── create-<entity>.ts
            ├── update-<entity>.ts
            ├── delete-<entity>.ts
            └── lock-<entity>.ts
```

A nested group such as `platform/` has its own `index.ts` re-exporting each child's `routes.js`, and each child's `NAMESPACE` carries the full prefix (`/platform/me`). Relative imports end in `.js` (ESM).

## Naming

| Thing | Convention | Example |
|---|---|---|
| Namespace | plural, kebab-case, matches the URL prefix | `/agencies`, `/app-configs` |
| Handler file | `<verb>-<entity>.ts` | `get-agency.ts`, `list-agencies.ts` |
| Handler export | `<verb><Entity>Handler` | `getAgencyHandler`, `listAgenciesHandler` |
| Sub-resource list | `list-<entities>.ts` inside the parent namespace | `users/handlers/list-organizations.ts` |
| Route path | REST-shaped | `/`, `/:id`, `/:id/lock`, `/list-agencies` |

`API_ROUTES` is generated from these files: `npm run repo:routes` reads each `routes.ts`'s `NAMESPACE` and `instance.<method>` paths and writes `packages/consts/src/app-routes.ts`. The key name derives from the namespace and path, so choose both with the resulting constant in mind (`/agencies` + `/:id/lock` → `AGENCIES_DETAIL_LOCK(id)`). Older namespaces use verb paths (`/list`, `/:id/update`); new namespaces follow agencies.

## routes.ts

```ts
/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { getAgencyHandler } from './handlers/get-agency.js';

/* * */

const NAMESPACE = '/agencies';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.agencies.scope, [PermissionCatalog.all.agencies.actions.read]) },
			getAgencyHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
```

- Every route names its scope and actions through `PermissionCatalog.all.<scope>` rather than string literals.
- `authorizationMiddleware()` with no arguments means "any authenticated user" (platform routes). Auth routes (`login`, `logout`) register with no preHandler.
- One `instance.<method>` call per route, in the order list, get, create, update, custom actions, delete.

## Handlers

```ts
/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Agency, type UpdateAgencyDto, UpdateAgencySchema } from '@tmlmobilidade/go-types-core';

/**
 * Updates an Agency in the database
 * @param request The request object
 * @param reply The reply object
 */
export async function updateAgencyHandler(request: FastifyRequest<{ Body: UpdateAgencyDto, Params: { id: string } }>, reply: FastifyReply<Agency>) {
	//

	//
	// Validate the request body

	const validatedAgency = UpdateAgencySchema.safeParse({
		...request.body,
		updated_by: request.me._id,
	});

	if (!validatedAgency.success) {
		return sendErrorApiResponse(reply, {
			error: validatedAgency.error.message,
			status_code: '400',
		});
	}

	//
	// Update the agency in the database

	const updatedAgencyData = await goDb.core.agencies.updateById(request.params.id, validatedAgency.data);

	return sendSuccessApiResponse(reply, updatedAgencyData);
}
```

Rules the exemplar encodes:

- **Signature**: `FastifyRequest<{ Body, Params, Querystring }>` narrowed to what the route uses; `FastifyReply<T>` where `T` is the success payload type. Generic imports use `type`.
- **Sections**: a bare `//` after the opening brace, then a `//` + `// <what this step does>` comment pair before each step. Steps are prose; the lettered A–F scheme belongs to the frontend.
- **Responses**: `return sendSuccessApiResponse(reply, data)` and `return sendErrorApiResponse(reply, { error, status_code })`. `status_code` is a string (`'400'`, `'404'`). Pass `{ max_age: '5m' }` as the third argument of the success helper when the payload is cacheable.
- **Validation**: `Schema.safeParse(...)` on the body, spreading `updated_by: request.me._id` (update) or `created_by` and `updated_by` (create) before parsing. Failure returns `'400'` with `error.message`.
- **Not found**: `findById` returning nothing → `'404'` with `` `Agency with ID ${request.params.id} not found` ``.
- **Lists**: `findMany()`, then `XListItemSchema.array().parse(found)` so the wire shape is the trimmed list item. An empty collection returns `'404'` with `'No agencies found'`.
- **Filtered lists** (POST body of filters): narrow resource filters with `PermissionCatalog.filterPermissionResourceValues` against `request.permissions` first, then `FiltersSchema.parse(request.body)`. See `modules/operation/apps/api/src/endpoints/rides/handlers/list-rides.ts`.
- **Database**: only through `goDb.<module>.<collection>` (`findById`, `findOne`, `findMany`, `insertOne`, `updateById`, `deleteById`, `count`, `aggregate`). A missing collection is added in `packages-new/interfaces/godb/src/databases/<module>.ts`.
- **Current user**: `request.me._id`; resolved permissions: `request.permissions`.

## Types a new endpoint needs

| Type | Package | Location |
|---|---|---|
| Entity, `CreateXDto`, `UpdateXDto`, `CreateXSchema`, `UpdateXSchema` | `@tmlmobilidade/go-types-<module>` | `packages-new/types/<module>` |
| `XListItem`, `XListItemSchema` (`.pick()` of the entity schema, `.transform()` for `*_normalized` search fields) | `@tmlmobilidade/go-<module>-pckg-types` | `modules/<module>/packages/types/src/<feature>/list/` |
| Filters DTO for POST lists | `@tmlmobilidade/go-<module>-pckg-types` | same package |
| Scope and actions | `@tmlmobilidade/go-types-permissions` | `PermissionCatalog` |

Apps consume packages from `dist`, so rebuild a changed package before the app sees it.

## Do not

Each line names a pattern still present in older namespaces or a tempting shortcut, and the convention that replaces it.

- **No controller classes, no `*.controller.ts` / `*.routes.ts` file names.** One handler per file under `handlers/`, one `routes.ts` per namespace.
- **No `HttpException`, no `reply.send({ data, error, statusCode })`, no `reply.status(n).send(...)`.** Every response goes through `sendSuccessApiResponse` or `sendErrorApiResponse`.
- **No numeric or `HTTP_STATUS` status codes in the response helpers.** `status_code` is the string form (`'400'`, `'404'`).
- **No unvalidated `request.body` reaching the database.** Parse it with the Zod schema first, spreading `created_by` / `updated_by` from `request.me._id` before parsing.
- **No `Omit<Entity, ...>` or hand-written body types in the handler signature.** Use the `CreateXDto` / `UpdateXDto` from the types package; add the DTO if it is missing.
- **No string-literal scopes or actions in `authorizationMiddleware`.** Use `PermissionCatalog.all.<scope>.scope` and `.actions.<action>`.
- **No route without a preHandler**, except the auth namespace. A route open to any signed-in user still gets `authorizationMiddleware()`.
- **No raw MongoDB client, no `getCollection()` in a handler.** Use the typed `goDb.<module>.<collection>` methods; add a method to the godb factory when one is missing.
- **No returning the full entity from a list endpoint.** Parse through `XListItemSchema.array()` so the payload carries only the list columns.
- **No filtering by `agency_id` from the body without `PermissionCatalog.filterPermissionResourceValues`.** The user's resource permissions narrow the filter before the query runs.
- **No `console.log` left in a handler.** Errors return through the response helper; the request logger already records the call.
- **No `throw new error()` or swallowed `try/catch`.** Let unexpected errors propagate to Fastify's error handler, or return a specific `sendErrorApiResponse`.
- **No business logic in `routes.ts`.** It only maps paths to handlers and permissions.
- **No hand edits to `packages/consts/src/app-routes.ts`.** It is generated from `routes.ts`; run `npm run repo:routes` after changing a namespace or path.
- **No relative imports without the `.js` extension.** The app runs as ESM.
- **No `any`, no `@ts-ignore`, no `eslint-disable`.** Fix the type or the rule violation; `npm run lint` must pass unaided.

## Adding an endpoint: order of work

1. Types: entity or DTO schema, list item schema, permission action if new.
2. Collection in godb if the entity is new.
3. Handler file in `handlers/`, JSDoc first, then the sectioned body.
4. Route in `routes.ts` with its `PermissionCatalog` preHandler. A new namespace also gets its line in `endpoints/index.ts`.
5. `npm run repo:routes` at the repo root so `API_ROUTES` carries the new key, then rebuild `@tmlmobilidade/consts`.
6. `npm run lint` in the app directory passes clean (eslint sorts imports and object keys; `tsc --noEmit` type-checks).
