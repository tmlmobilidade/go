---
name: review-go
description: Runs a structured pre-PR review on GO monorepo diffs (general, frontend, backend, types/interfaces, monorepo hygiene) and outputs a blocker/warning report. Use when reviewing staged or recent changes, convention compliance before a PR, or when the user asks for a GO code review.
disable-model-invocation: true
---

# Review

You are reviewing code changes in the GO monorepo before a pull request. Run a structured review across all affected areas and output a clear report.

## How to get the diff
If not already visible, ask the user to provide the diff or run:
```bash
git diff main...HEAD
```
Or review the currently open/staged files if that's what the user points to.

## Review areas

For each area, only review if files from that area are present in the diff.

---

### General (always check)
- Commit messages follow the TML conventional commit format (`type(scope): description`)
- No hardcoded secrets, API keys, or `.env` values committed
- TypeScript: no `any`, no `@ts-ignore` without explanation
- No `TODO` comments left without a linked issue

---

### Frontend (`*.tsx`, `*.module.css`, `contexts/`, `hooks/`)
- Component structure: one component per file, named export, correct folder layout
- Section comments: A–F present and in order where applicable
- Context pattern: correct interface shape (`actions`, `data`, `filters`, `flags`), flags use `is_`/`can_`/`has_` prefixes
- No default exports
- No inline styles — CSS Modules only
- `'use client'` present where hooks/state/events are used
- i18n: no hardcoded user-visible strings — all in `src/i18n/namespaces/`
- No direct `@mantine/*` imports in module frontends — must go through `@tmlmobilidade/ui`
- SWR used with `API_ROUTES` from `@tmlmobilidade/consts` — no hardcoded URL strings
- Flag hooks (`useFlagCanSave`, `useFlagReadOnly`, etc.) used instead of manual boolean logic
- Mutations wrapped in `useHandleUpdate`

---

### Backend (`*.routes.ts`, `*.controller.ts`, `apps/api/**`)
- Routes: every endpoint has `authorizationMiddleware` preHandler
- Controllers: static class, JSDoc on every method
- Response shape always `{ data, error, statusCode }` — no exceptions
- Errors thrown via `HttpException` — no `reply.status(...).send(...)` for errors
- Request bodies validated with `safeParse` before any write operation
- No raw MongoDB queries in controllers — use `@tmlmobilidade/interfaces` methods
- HTTP status codes from `HTTP_STATUS` — no hardcoded numbers

---

### Types/Interfaces (`packages/types/**`, `packages/interfaces/**`)
- New types follow existing naming: `[Resource]`, `Create[Resource]Dto`, `Update[Resource]Dto`
- Matching Zod schemas for every DTO
- New interfaces follow the existing typed pattern in `packages/interfaces`

---

### Monorepo hygiene
- New packages have correct `@tmlmobilidade/` scope name
- New module scripts added to root `package.json` following naming convention
- Route generation: if `page.tsx` or `*.routes.ts` files were added/renamed/removed, `npm run generate-routes` must be run — flag if it looks like it wasn't
- `app-routes.ts` not manually edited (it's auto-generated)

---

## Output format

Structure your report like this:

```
## Review Report

### ✅ Looks good
- [list things that are correct and worth noting]

### ⚠️ Warnings (won't block PR, but should be addressed)
- [file:line] description

### ❌ Blockers (must fix before merge)
- [file:line] description

### 📋 Reminders
- [anything the developer should do before or after merging, e.g. run generate-routes]
```

Be specific — always include the file and approximate location. Don't list generic advice; only flag actual issues found in the diff.
