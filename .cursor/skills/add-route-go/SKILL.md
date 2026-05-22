---
name: add-route-go
description: Scaffolds a new API route and static controller for an existing GO module (CRUD, authorization, consts regeneration). Use when adding a new resource endpoint to a module's API app or wiring routes and PermissionCatalog-backed preHandlers.
disable-model-invocation: true
---

# Add Route

You are adding a new API route to a GO module. Follow every step in order. Ask for the **module name** and **resource name** if not provided.

## Steps

### 1. Confirm inputs
- `[module]` — the module name (e.g. `alerts`, `fleet`)
- `[resource]` — the resource name in singular, lowercase, kebab-case (e.g. `alert`, `vehicle-event`)

### 2. Create the routes file
Path: `modules/[module]/apps/api/src/endpoints/[resource]/[resource].routes.ts`

- Import the controller from `@/endpoints/[resource]/[resource].controller.js`
- Import `authorizationMiddleware`, `FastifyInstance`, `FastifyService` from `@tmlmobilidade/fastify`
- Import `PermissionCatalog` from `@tmlmobilidade/types`
- Set `const namespace = '/[resource]s'` (plural)
- Register via `server.register(...)` with `{ prefix: namespace }`
- Scaffold all 5 CRUD routes: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`
- Every route gets an `authorizationMiddleware` preHandler using `PermissionCatalog.all.[module].[resource].scope` and the matching action

### 3. Create the controller file
Path: `modules/[module]/apps/api/src/endpoints/[resource]/[resource].controller.ts`

- Export a single static class: `[Resource]Controller` (PascalCase)
- Implement: `getAll`, `getById`, `create`, `update`, `delete`
- Import types: `[Resource]`, `Create[Resource]Dto`, `Create[Resource]Schema`, `Update[Resource]Dto`, `Update[Resource]Schema` from `@tmlmobilidade/types`
- Import the collection interface: `[resource]` from `@tmlmobilidade/interfaces`
- Import `HTTP_STATUS`, `HttpException` from `@tmlmobilidade/consts`
- `create` and `update` must validate with `safeParse` before writing — throw `HttpException(HTTP_STATUS.BAD_REQUEST, ...)` on failure
- `getById` and `delete` must throw `HttpException(HTTP_STATUS.NOT_FOUND, ...)` if the document is not found
- Response shape is always: `{ data: T | null, error: null, statusCode: HTTP_STATUS.X }`
- JSDoc every method

### 4. Register in endpoints index
File: `modules/[module]/apps/api/src/endpoints/index.ts`

Add a side-effect import for the new routes file:
```ts
import '@/endpoints/[resource]/[resource].routes.js';
```

### 5. Regenerate routes
Remind the user to run:
```bash
npm run generate-routes
```
This updates `API_ROUTES` in `@tmlmobilidade/consts` automatically. The new route keys will be available as `API_ROUTES.[module].[RESOURCE]_LIST` and `API_ROUTES.[module].[RESOURCE]_DETAIL`.

### 6. Checklist before finishing
- [ ] Routes file created with all 5 CRUD endpoints
- [ ] Controller file created as a static class with JSDoc
- [ ] Registered in `endpoints/index.ts`
- [ ] `Create[Resource]Dto`, `Update[Resource]Dto`, matching Zod schemas exist in `@tmlmobilidade/types` (if not, flag this — they need to be added first)
- [ ] `[resource]` interface exists in `@tmlmobilidade/interfaces` (if not, flag this — it needs to be added first)
- [ ] `PermissionCatalog.all.[module].[resource]` scope and actions exist in `@tmlmobilidade/types` (if not, flag this)
- [ ] User reminded to run `npm run generate-routes`
