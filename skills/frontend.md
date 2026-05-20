# Skill: Frontend — GO Specific

GO-specific frontend conventions. Load after the `tml-context` and `tml-frontend` skills. Those cover the base TML patterns; this file covers what is specific to the GO monorepo.

---

## Module frontend structure

Each module's frontend lives at `modules/[module]/apps/frontend/src/`:

```
modules/[module]/apps/frontend/src/
├── app/                  ← Next.js App Router (pages, layouts, loading states)
│   └── (group)/          ← route groups for layout sharing
├── components/
│   ├── [feature]/        ← feature folder (list, detail, create, common, etc.)
│   │   ├── FeatureName.context.tsx   ← context co-located here, not in /contexts/
│   │   ├── FeatureName/
│   │   │   └── index.tsx
│   │   └── FeatureNameSubComponent/
│   │       ├── index.tsx
│   │       └── styles.module.css
│   └── common/           ← shared components within this module
├── i18n/
│   ├── i18n.d.ts
│   ├── namespaces/
│   │   └── default/
│   │       └── pt.json
│   └── resources.ts
├── lib/                  ← module-level utility functions
├── providers/            ← root data providers (wrap app layout)
└── types/
    └── normalized.ts     ← types for locally normalised/transformed data
```

---

## Context in GO frontends

Contexts follow the general TML pattern (see `tml-frontend` skill) but extend `DetailContextStateTemplate` from `@tmlmobilidade/ui` for detail views.

```tsx
import { type DetailContextStateTemplate } from '@tmlmobilidade/ui';

interface AlertDetailContextState extends DetailContextStateTemplate<UpdateAlertDto> {
  actions: DetailContextStateTemplate<UpdateAlertDto>['actions'] & {
    customAction: () => void
  }
  data: {
    item: Alert | undefined
    id: string | undefined
  }
  flags: DetailContextStateTemplate<UpdateAlertDto>['flags'] & {
    isCustomFlag: boolean
  }
}
```

`DetailContextStateTemplate<TDto>` provides the standard shape for detail/edit views: `actions.save`, `actions.delete`, `actions.lock`, `actions.duplicate`, `form.instance`, and common flags.

---

## Data fetching

Use SWR with routes from `@tmlmobilidade/consts`:

```tsx
import { API_ROUTES } from '@tmlmobilidade/consts';
import useSWR from 'swr';

const { data, error, isLoading, mutate } = useSWR<Alert>(
  API_ROUTES.alerts.ALERTS_DETAIL(alertId)
);
```

Always destructure `mutate` so you can invalidate after mutations. For list invalidation after a detail mutation, also destructure `mutate` from the list SWR key.

---

## Forms

Use `useContextForm` from `@tmlmobilidade/ui` for all forms inside context providers. It handles syncing with API data and tracks dirty state.

```tsx
import { useContextForm } from '@tmlmobilidade/ui';
import { type UpdateAlertDto } from '@tmlmobilidade/types';

const { form } = useContextForm<UpdateAlertDto>({
  apiData: alertData,
  // schema: UpdateAlertSchema,  ← uncomment to enable Zod validation
});
```

Access form state via `form.formState.isDirty`, `form.formState.isValid`, `form.getValues()`, `form.reset()`.

---

## Flag hooks

GO frontends use dedicated flag hooks from `@tmlmobilidade/ui` to compute permission-aware UI state. Always use these instead of computing flags manually.

```tsx
import {
  useFlagCanDelete,
  useFlagCanDuplicate,
  useFlagCanLock,
  useFlagCanSave,
  useFlagReadOnly,
} from '@tmlmobilidade/ui';

const { isReadOnly } = useFlagReadOnly({
  hasPermission: meContext.actions.hasPermissionResource([...]),
  isDeleting,
  isLoading: alertLoading,
  isLocked: alertData?.is_locked,
  isLocking,
  isSaving,
});

const { canSave } = useFlagCanSave({
  hasPermission: ...,
  isDeleting,
  isDirty: form.formState.isDirty,
  isLoading: alertLoading,
  isLocked: alertData?.is_locked,
  isLocking,
  isValid: form.formState.isValid,
});
```

---

## Permissions

Permissions are always checked via `PermissionCatalog` from `@tmlmobilidade/types` and `useMeContext` from `@tmlmobilidade/ui`.

```tsx
import { PermissionCatalog } from '@tmlmobilidade/types';
import { useMeContext } from '@tmlmobilidade/ui';

const meContext = useMeContext();

meContext.actions.hasPermissionResource([
  {
    action: PermissionCatalog.all.alerts.actions.update,
    resource_key: 'agency_ids',
    scope: PermissionCatalog.all.alerts.scope,
    value: alertData?.agency_id,
  },
]);
```

Each module has its own scope and set of actions in `PermissionCatalog.all.[module]`.

---

## Mutations

Wrap all mutations in `useHandleUpdate` from `@tmlmobilidade/ui`. It handles loading state and success/error callbacks consistently.

```tsx
import { useHandleUpdate } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';

const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
  fetchFn: async () => await fetchData<Alert>(
    API_ROUTES.alerts.ALERTS_DETAIL(alertId),
    'PUT',
    form.getValues()
  ),
  onSuccess: (updatedItem) => {
    form.reset(updatedItem);
    alertMutate(updatedItem);
    alertsListMutate();
  },
});
```

---

## UI components

All UI comes from `@tmlmobilidade/ui`. Do not install Mantine directly in module frontends — use the wrappers from the shared package.

Common components:

| Component | Use |
|---|---|
| `Pane` | Main content area with optional header actions |
| `LoadingOverlay` | Full-pane loading state |
| `ErrorDisplay` | Full-pane error state |
| `ComponentWrapper` | Labelled section wrapper |
| `SaveButton` / `DeleteButton` / `LockButton` / `DuplicateButton` | Action buttons with built-in loading state |

```tsx
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

if (context.flags.isLoading) return <LoadingOverlay />;
if (context.flags.error) return <ErrorDisplay message={context.flags.error.message} />;

return (
  <Pane header={[<FeatureHeader key="header" />]}>
    <FeatureSectionOne />
    <FeatureSectionTwo />
  </Pane>
);
```

---

## Navigation

Page routes come from `@tmlmobilidade/consts`. Use `keepUrlParams` from `@tmlmobilidade/ui` when navigating to preserve active filters.

```tsx
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push(keepUrlParams(PAGE_ROUTES.alerts.ALERTS_LIST));
```

---

## Data providers

Each module frontend has a `providers/data-providers.tsx` that wraps the app layout with SWR and context providers. New global providers go here, not in the page components.

---

## Working with Mantine

`@tmlmobilidade/ui` wraps Mantine — never import from `@mantine/*` directly in module frontends. All shared components, theming, and Mantine configuration live in the `packages/ui` package.

When you need to add a new Mantine component to `@tmlmobilidade/ui`, or change how an existing wrapper works, consult the Mantine docs via **`@Docs` in Cursor** (add `https://mantine.dev/llms.txt` as the source). This gives you accurate, version-matched props and usage examples without hallucination.

Common scenarios:
- Adding a new wrapper component to `packages/ui` → check Mantine props via `@Docs`
- Debugging a Mantine styling issue in an existing `packages/ui` component → check Mantine Styles API via `@Docs`
- Theming changes in `packages/ui/src/providers/MantineProvider` → check Mantine theme docs via `@Docs`

Do not install `@mantine/*` packages anywhere outside `packages/ui`.
