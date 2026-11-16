---
name: go-frontend-i18n
description: Organize and clean up i18n translation keys in GO monorepo frontend apps (modules/*/apps/frontend). Use after frontend implementation or refactoring to ensure translations follow the part, block, and React component hierarchy.
---

# GO Frontend i18n Conventions

## Purpose

Maintain a consistent, predictable organization of i18n translation files and keys across GO frontend applications.

Apply these conventions when adding, modifying, refactoring, or cleaning up translations after a frontend task.

**Do not change user-facing translation text unless explicitly required by the task.** Focus on organization, consistency, and preserving existing behavior.

## 1. Project structure

GO is a monorepo containing multiple modules. Each module may contain multiple applications, including frontend apps, APIs, and workers/daemons.

Frontend applications are organized into **parts**, **blocks**, and **React components**.

- **Module:** A top-level business domain, such as `core`, `operation`, or `infrastructure`.
- **App:** An application within a module, such as `frontend`.
- **Part:** A feature area within a frontend app, such as `users`, `rides`, or `stops`.
- **Block:** A functional subdivision of a part, such as `list`, `detail`, `create`, or `extract`.
- **Component:** A React component belonging to a block.

The conceptual hierarchy is:

`GO → module → apps → frontend → part → block → component`

Use the existing frontend `components` directory structure as the primary reference for identifying parts and blocks. Do not invent new parts or blocks solely to organize translations.

## 2. Translation file organization

### Rule 1: One i18n namespace per part

Each frontend **part** must have its own i18n namespace.

For example, the `operation` module contains the parts:

- `rides`
- `plans`
- `gtfs-validations`

The corresponding i18n namespace directories should be:

```text
rides/
  en.json
  pt.json
plans/
  en.json
  pt.json
gtfs-validations/
  en.json
  pt.json
```

These are illustrative language codes. Preserve the languages and file naming conventions already supported by the application.

Namespace names must match their corresponding part names.

### Rule 2: Top-level translation keys represent blocks

Each namespace's language JSON file should organize translations under top-level properties corresponding to the part's blocks.

For example, the `infrastructure` module's `stops` part contains:

- `list`
- `detail`
- `create`
- `extract`

The `stops/en.json` file should therefore follow this structure:

```json
{
  "list": {},
  "detail": {},
  "create": {},
  "extract": {}
}
```

Only include blocks that actually exist and require translations. Do not create empty properties solely for structural completeness.

### Rule 3: Group translations by React component

Inside each block, group translation keys under the **React component name** that consumes them.

Use the component's actual name in PascalCase, matching its source declaration.

For example:

```json
{
  "list": {
    "StopsList": {
      "title": "Stops",
      "empty_state": "No stops found"
    },
    "StopsFilters": {
      "search_placeholder": "Search stops",
      "clear_filters": "Clear filters"
    }
  },
  "create": {
    "CreateStopForm": {
      "title": "Create stop",
      "submit": "Create",
      "fields": {
        "name": {
          "label": "Name",
          "placeholder": "Enter stop name"
        }
      }
    }
  }
}
```

Each component should own the keys it directly consumes. Keys under the component name should always be set in snake case. Only the React component name is in PascalCase.

Avoid grouping unrelated components' translations under a single component.

### Rule 4: Component-level structure is flexible

Within each component, organize translation keys according to the component's complexity and responsibilities.

For simple components, use shallow properties:

```json
{
  "detail": {
    "StopStatus": {
      "active": "Active",
      "inactive": "Inactive"
    }
  }
}
```

For complex components, use nested properties to group related translations:

```json
{
  "create": {
    "CreateStopForm": {
      "title": "Create stop",
      "fields": {
        "name": {
          "label": "Name",
          "required": "Name is required"
        },
        "code": {
          "label": "Code",
          "required": "Code is required"
        }
      },
      "actions": {
        "submit": "Create stop",
        "cancel": "Cancel"
      },
      "feedback": {
        "success": "Stop created successfully",
        "error": "Unable to create stop"
      }
    }
  }
}
```

Prefer descriptive, semantic key names over generic or positional names.

Avoid unnecessary nesting when it does not improve readability.

## 3. Using translation keys in React components

When adding or updating translations:

1. Identify the module and frontend app.
2. Identify the part and block containing the component.
3. Identify the React component consuming the translation.
4. Place the translation under the correct namespace, block, and component.
5. Update the component's translation references to match the resulting structure.

For example, a component named `StopsFilters` inside the `stops` part's `list` block should reference:

```typescript
t('stops:list.StopsFilters.searchPlaceholder')
```

Follow the existing project's i18n library, hooks, and namespace-loading conventions. Do not introduce a new i18n integration pattern.

## 4. Cleaning up existing translations

After completing a frontend task, inspect the translations associated with the affected components.

Perform the following cleanup when applicable:

1. **Correct namespace placement:** Move keys to the namespace corresponding to the component's part.
2. **Correct block placement:** Ensure keys are grouped under their corresponding block.
3. **Correct component ownership:** Move keys under the component that actually consumes them.
4. **Remove unused keys:** Delete keys only after verifying they are no longer referenced.
5. **Avoid unnecessary duplication:** Reuse existing translations when the same component consumes the same message in multiple places.
6. **Preserve translations:** When moving or renaming keys, preserve their existing values, interpolation variables, pluralization rules, and formatting.
7. **Update references:** Update all affected translation references when keys or namespaces change.
8. **Maintain language parity:** Apply the same structural changes across all supported language files.

Never remove or rename a translation key based only on a text search if it may be referenced dynamically.

## 5. Shared and exceptional cases

### Shared components

If a component is reused across multiple blocks, keep its translations in a single canonical location according to the project's existing shared-component conventions, like in a `shared` namespace/part or block.

Do not duplicate the same component's translations across blocks merely because the component is reused.

If no established shared-component convention exists, preserve the current organization rather than inventing a new namespace or hierarchy.

What decides if a keys is reused is the existing component placement:
- if the component is in a shared directory inside the components folder (`/components/shared/...`) then it should be places in a shared namespace in i18n.
- if the component is inside a shared directory in the part folder (`/components/stops/shared`) then it should be added as a top-level property to the i18n namespace of that part.
- if the content of one key is the same as other key, but the components are not in a shared namespace then the keys should not be considered shared and the regular rules in `## 2.` apply.

### Dynamic translation keys

Translation keys may be constructed dynamically or referenced through variables.

Before moving or deleting such keys, inspect how they are resolved at runtime. Preserve the complete set of possible keys.

### Components outside the standard hierarchy

Some frontend components may not belong to a clearly identifiable part or block.

For these components, follow existing project conventions. Do not force them into unrelated parts or create arbitrary blocks to satisfy the hierarchy. Ask questions to the developer when in doubt.

## 6. Validation

After modifying i18n files or translation references:

- Ensure all modified JSON files are valid.
- Ensure translation key structures are consistent across supported languages.
- Ensure all modified translation references resolve to existing keys.
- Ensure interpolation variables, pluralization, and formatting remain compatible across languages.
- Ensure no translation values were unintentionally changed.
- Run relevant existing i18n checks, type checks, linting rules or tests when available.

Do not claim that keys are unused or that all references are valid unless they have been sufficiently verified.

## 7. Scope and constraints

- Focus on the frontend app and components affected by the current task.
- Do not reorganize unrelated modules or parts.
- Preserve existing translation values unless the task requires content changes.
- Avoid unnecessary modifications to the i18n configuration or loading infrastructure.
- Follow existing formatting and JSON conventions.
- Prefer minimal, targeted changes over broad restructuring.

## Expected outcome

After cleanup, translation keys should follow:

```text
<namespace = part>
  └── <block>
        └── <ReactComponentName>
              └── <translationKey>
```

The final organization should be easy to navigate from the component source code, consistent across languages, and compatible with all existing translation references.