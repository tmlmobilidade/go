# Skill: Backend — GO Specific

GO-specific backend conventions. Load after the `tml-context` skill.

---

## Stack

- **HTTP framework:** Fastify (via `@tmlmobilidade/fastify`)
- **Validation:** Zod (schemas from `@tmlmobilidade/types`)
- **Database:** MongoDB (via `@tmlmobilidade/interfaces` and `@tmlmobilidade/mongo`)
- **Auth:** Permission-based middleware from `@tmlmobilidade/fastify`

---

## API app structure

Each module's API lives at `modules/[module]/apps/api/src/`:

```
modules/[module]/apps/api/src/
├── endpoints/
│   ├── index.ts              ← imports all route files (side-effect imports)
│   └── [resource]/
│       ├── [resource].routes.ts      ← registers Fastify routes
│       └── [resource].controller.ts  ← static class with handler methods
├── utils/                    ← API-internal utilities
├── main.ts                   ← bootstraps the Fastify server
└── index.ts                  ← entry point, imports endpoints/index.ts
```

---

## Routes file

The routes file registers endpoints under a namespaced prefix. Every route gets an `authorizationMiddleware` preHandler.

```ts
import { ResourceController } from '@/endpoints/resource/resource.controller.js';
import { authorizationMiddleware, type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const namespace = '/resource';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
  (instance, opts, next) => {
    //

    instance.get(
      '/',
      { preHandler: authorizationMiddleware(PermissionCatalog.all.resource.scope, [PermissionCatalog.all.resource.actions.read]) },
      ResourceController.getAll,
    );

    instance.get(
      '/:id',
      { preHandler: authorizationMiddleware(PermissionCatalog.all.resource.scope, [PermissionCatalog.all.resource.actions.read]) },
      ResourceController.getById,
    );

    instance.post(
      '/',
      { preHandler: authorizationMiddleware(PermissionCatalog.all.resource.scope, [PermissionCatalog.all.resource.actions.create]) },
      ResourceController.create,
    );

    instance.put(
      '/:id',
      { preHandler: authorizationMiddleware(PermissionCatalog.all.resource.scope, [PermissionCatalog.all.resource.actions.update]) },
      ResourceController.update,
    );

    instance.delete(
      '/:id',
      { preHandler: authorizationMiddleware(PermissionCatalog.all.resource.scope, [PermissionCatalog.all.resource.actions.delete]) },
      ResourceController.delete,
    );

    next();
  },
  { prefix: namespace },
);
```

---

## Controller file

Controllers are static classes. Each method is a Fastify handler. JSDoc every method.

```ts
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { resource } from '@tmlmobilidade/interfaces';
import { type CreateResourceDto, CreateResourceSchema, type Resource, type UpdateResourceDto, UpdateResourceSchema } from '@tmlmobilidade/types';

/* * */

export class ResourceController {
  //

  /**
   * Returns all resources.
   */
  static async getAll(request: FastifyRequest, reply: FastifyReply<Resource[]>) {
    const all = await resource.findMany({});
    reply.send({ data: all, error: null, statusCode: HTTP_STATUS.OK });
  }

  /**
   * Returns a resource by ID.
   */
  static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Resource>) {
    const found = await resource.findById(request.params.id);
    if (!found) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Resource not found');
    reply.send({ data: found, error: null, statusCode: HTTP_STATUS.OK });
  }

  /**
   * Creates a new resource.
   */
  static async create(request: FastifyRequest<{ Body: CreateResourceDto }>, reply: FastifyReply<Resource>) {
    const inserted = await resource.insertOne({ ...request.body, created_by: request.me._id, updated_by: request.me._id });
    reply.send({ data: inserted, error: null, statusCode: HTTP_STATUS.CREATED }).status(HTTP_STATUS.CREATED);
  }

  /**
   * Updates a resource by ID.
   */
  static async update(request: FastifyRequest<{ Body: UpdateResourceDto, Params: { id: string } }>, reply: FastifyReply<Resource>) {
    const validated = UpdateResourceSchema.safeParse(request.body);
    if (!validated.success) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Invalid data', validated.error);
    const updated = await resource.updateById(request.params.id, validated.data);
    reply.send({ data: updated, error: null, statusCode: HTTP_STATUS.OK });
  }

  /**
   * Deletes a resource by ID.
   */
  static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
    await resource.deleteById(request.params.id);
    reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
  }

  //
}
```

---

## Response shape

Every response follows this structure — no exceptions:

```ts
{ data: T | null, error: string | null, statusCode: number }
```

Use `HTTP_STATUS` from `@tmlmobilidade/consts` for all status codes. Never hardcode numbers.

---

## Error handling

Throw `HttpException` from `@tmlmobilidade/consts` for expected errors. Fastify's error handler will catch it and format the response correctly.

```ts
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';

throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Resource not found');
throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Invalid data', zodError);
```

Do not use `reply.status(...).send(...)` for errors — always throw.

---

## Authentication and permissions

`request.me` contains the authenticated user (injected by `@tmlmobilidade/fastify`). `request.permissions` contains the user's resolved permissions.

For permission-filtered queries (e.g. a user can only see their agency's data):

```ts
const userPermissions = PermissionCatalog.get(
  request.permissions,
  PermissionCatalog.all.alerts.scope,
  PermissionCatalog.all.alerts.actions.read,
);

const query = userPermissions.resources?.agency_ids?.includes(PermissionCatalog.ALLOW_ALL_FLAG)
  ? {}
  : { agency_id: { $in: userPermissions.resources?.agency_ids ?? [] } };

const results = await alerts.findMany(query);
```

---

## Validation

Validate request bodies with Zod schemas from `@tmlmobilidade/types`. Use `safeParse` so you can handle the error gracefully:

```ts
const validated = UpdateAlertSchema.safeParse(request.body);
if (!validated.success) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Invalid data', validated.error);
```

DTOs and schemas are co-located in `@tmlmobilidade/types`. The convention is:
- Type: `UpdateAlertDto`
- Schema: `UpdateAlertSchema`
- Both exported from the same types package.

---

## Database operations

Use `@tmlmobilidade/interfaces` for all MongoDB access. Each collection is exposed as a named export with typed methods:

```ts
import { alerts, files } from '@tmlmobilidade/interfaces';

// Read
const found = await alerts.findById(id);
const all = await alerts.findMany({ agency_id: 'xxx' }, { sort: { created_at: -1 } });

// Write
const inserted = await alerts.insertOne(data);
const updated = await alerts.updateById(id, partialData);
await alerts.deleteById(id);

// Custom operations
await alerts.toggleLockById(id);
```

Do not write raw MongoDB queries in controllers. If a query is not covered by the interface, add the method to `@tmlmobilidade/interfaces`.

---

## Naming conventions

| Thing | Convention |
|---|---|
| Route namespace | `/resource` (plural, lowercase, kebab-case) |
| Controller class | `ResourceController` (PascalCase, singular) |
| Controller methods | `getAll`, `getById`, `create`, `update`, `delete` |
| Route file | `resource.routes.ts` |
| Controller file | `resource.controller.ts` |
| Custom actions | `lock`, `duplicate`, `describe`, `upload[Thing]` |
| DTO types | `CreateResourceDto`, `UpdateResourceDto` |
| Zod schemas | `CreateResourceSchema`, `UpdateResourceSchema` |

---

## Adding a new endpoint

1. Create `endpoints/[resource]/[resource].routes.ts` — register routes with auth middleware
2. Create `endpoints/[resource]/[resource].controller.ts` — implement handler methods
3. Import the routes file in `endpoints/index.ts` (side-effect import: `import '@/endpoints/resource/resource.routes.js'`)
4. Add types and Zod schemas to `@tmlmobilidade/types` if needed
5. Add DB interface methods to `@tmlmobilidade/interfaces` if needed
