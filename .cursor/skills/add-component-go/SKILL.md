---
name: add-component-go
description: Guides adding a named UI component or hook to packages/ui (Mantine wrappers, CSS modules, barrel exports, build reminder). Use when creating a new wrapper component, extending a Mantine component, adding a reusable hook to the shared UI package, or working under packages/ui for new @tmlmobilidade/ui surface.
disable-model-invocation: true
---

# Add Component

You are adding a new component or hook to `packages/ui`. Ask for the **component name** if not provided (PascalCase, e.g. `StatusBadge`, `ConfirmModal`).

## Steps

### 1. Confirm inputs
- `[ComponentName]` — PascalCase component name
- Type — ask: wrapper around a Mantine component, or custom TML component?
- Does it need styles? (most components do)

### 2. Check for existing Mantine component
If this wraps or extends a Mantine component, use **`@Docs`** in Cursor with `https://mantine.dev/llms.txt` to look up:
- Correct props and their types
- Polymorphic props if needed (`component` prop)
- Styles API keys for CSS customisation

Do this before writing any code.

### 3. Create the component folder
Path: `packages/ui/src/components/[ComponentName]/`

```
[ComponentName]/
├── index.tsx
└── styles.module.css    ← include unless the component has zero styles
```

### 4. Write index.tsx
- Named export only — never default export
- `'use client'` at the top if the component uses hooks, state, or event handlers
- If wrapping Mantine: import from `@mantine/core` (allowed in `packages/ui`) and apply TML theming/conventions on top
- Props interface named `[ComponentName]Props`
- CSS Modules for all styles — import from `./styles.module.css`
- Use `clsx` for conditional class names
- Follow the section comment pattern (A–F) if the component has non-trivial logic

### 5. Export from the package barrel
File: `packages/ui/src/index.ts`

Add a named export:
```ts
export { ComponentName } from './components/ComponentName/index.js';
```

### 6. If adding a hook instead
Path: `packages/ui/src/hooks/use[HookName].ts`

- Named export: `export function use[HookName](...)`
- Export from `packages/ui/src/index.ts`

### 7. Checklist before finishing
- [ ] Component folder created with `index.tsx` and `styles.module.css`
- [ ] Named export only (no default export)
- [ ] Props interface defined
- [ ] Mantine props verified via `@Docs` if applicable
- [ ] CSS Modules used — no inline styles
- [ ] Exported from `packages/ui/src/index.ts`
- [ ] Remind user: run `npm run build:ui` (or `npm run build:packages`) so consuming module frontends pick up the new export
