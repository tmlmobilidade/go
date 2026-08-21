---
name: add-module-go
description: Scaffolds a new domain module in the GO monorepo (API, optional frontend, types, interfaces, PermissionCatalog, root scripts, commitlint). Use when adding a new module with its own API, frontend, and optionally workers, or when the user asks to create a GO module.
disable-model-invocation: true
---

# Add Module

You are creating a new GO module. Follow every step in order. Ask for the **module name** if not provided (lowercase, kebab-case, e.g. `fleet`, `alerts`).

## Steps

### 1. Confirm inputs
- `[module]` — module name (lowercase, kebab-case)
- Apps needed — ask which apps are required: `api`, `frontend`, workers (optional)

### 2. Create the folder structure
```
modules/[module]/
├── apps/
│   ├── api/
│   │   └── src/
│   │       ├── endpoints/
│   │       │   └── index.ts
│   │       ├── main.ts
│   │       └── index.ts
│   └── frontend/              ← only if frontend is needed
│       └── src/
│           ├── app/
│           ├── components/
│           ├── i18n/
│           ├── providers/
│           └── types/
└── environments/
    ├── development/secrets/.env
    ├── staging/secrets/.env
    └── production/secrets/.env
```

### 3. API app — package.json
Path: `modules/[module]/apps/api/package.json`

- `"name": "@tmlmobilidade/go-[module]-api"`
- `"version": "0.0.1"`
- Extend `@tmlmobilidade/go-utils-tsconfig/node.json`
- Deps: `@tmlmobilidade/go-clients-fastify`, `@tmlmobilidade/types`, `@tmlmobilidade/interfaces`, `@tmlmobilidade/consts`, `@tmlmobilidade/mongo`

### 4. API app — bootstrap files
`src/main.ts` — imports `FastifyService` from `@tmlmobilidade/go-clients-fastify`, imports `./index.js`, starts the server
`src/index.ts` — imports `./endpoints/index.js`
`src/endpoints/index.ts` — empty for now, will collect route imports

### 5. Frontend app — package.json (if needed)
Path: `modules/[module]/apps/frontend/package.json`

- `"name": "@tmlmobilidade/go-[module]-frontend"`
- Extend `@tmlmobilidade/go-utils-tsconfig/nextjs.json`
- Deps: `@tmlmobilidade/ui`, `@tmlmobilidade/types`, `@tmlmobilidade/consts`, `@tmlmobilidade/utils`, `next`, `react`, `react-dom`, `swr`

### 6. Register types in packages/types
In `packages/types/src/`:
- Create `[module]/[resource].types.ts` with the main type, `Create[Resource]Dto`, `Update[Resource]Dto`, and matching Zod schemas
- Export from the types package barrel

### 7. Register collection interface in packages/interfaces
In `packages/interfaces/src/`:
- Create `[resource].interface.ts` exporting a typed MongoDB collection instance
- Export from the interfaces barrel

### 8. Add permissions to PermissionCatalog
In `packages/types/src/auth/permission-catalog.ts`:
- Add `[module]` scope with `read`, `create`, `update`, `delete` actions
- Follow the existing pattern exactly

### 9. Add build/dev scripts to root package.json
Following the existing naming convention, add to root `package.json`:
```json
"build:[module]": "turbo build --filter=@tmlmobilidade/go-[module]-*",
"dev:[module]": "turbo dev --filter=@tmlmobilidade/go-[module]-*",
"dev:[module]:ui": "turbo dev --filter=@tmlmobilidade/go-[module]-api --filter=@tmlmobilidade/go-[module]-frontend"
```

### 10. Add scope to commitlint
In `commitlint.config.cjs` at the repo root, add `[module]` to the `scope-enum` array.

### 11. Checklist before finishing
- [ ] Folder structure created
- [ ] API `package.json` with correct name and deps
- [ ] API bootstrap files (`main.ts`, `index.ts`, `endpoints/index.ts`)
- [ ] Frontend `package.json` (if needed)
- [ ] Types registered in `packages/types`
- [ ] Interface registered in `packages/interfaces`
- [ ] `PermissionCatalog` updated
- [ ] Root `package.json` scripts added
- [ ] `commitlint.config.cjs` scope updated
- [ ] Remind user: run `npm run build:packages` before `npm run dev:[module]`
