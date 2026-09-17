---
name: go-frontend
description: GO module frontend conventions (modules/*/apps/frontend). Load when adding or editing a list, detail or create view, a filter, a data hook, a form context, a page under app/, or i18n keys in any GO frontend app.
---

Reference: `modules/core/apps/frontend` is the canonical app. Base TML patterns (component folders, lettered section comments, CSS modules) come from the `tml-frontend` skill; this file carries only what GO adds. When a rule here and the exemplar disagree, the exemplar wins: open it.

## Where things live

`app/` is boilerplate. Every visual element lives in `components/`.

| File in `app/` | Body |
|---|---|
| `<feature>/layout.tsx` | `PanesManager` with `[<XList key="list" />, <Fragment key="children">{children}</Fragment>]` |
| `<feature>/page.tsx` | `Surface` + `NoDataLabel` (the "select an item" placeholder) |
| `<feature>/[xId]/page.tsx` | `<XDetailFormContextProvider><XDetail /></XDetailFormContextProvider>` |
| `<feature>/[xId]/loading.tsx` | `<LoadingOverlay />` |

Pages are `export default async function Page()`. Nothing else goes in `app/`.

`components/<feature>/` splits by view:

```
components/agencies/
├── list/
│   ├── filters/                    ← one folder per filter + AgenciesListFiltersBar/
│   ├── table/                      ← AgenciesListCell<Name>/ custom cell renderers
│   ├── AgenciesList/index.tsx
│   ├── AgenciesListHeader/index.tsx
│   ├── AgenciesListHeaderMenu/index.tsx
│   └── use-agencies-list-data.ts
├── detail/
│   ├── AgenciesDetail/index.tsx
│   ├── AgenciesDetailHeader/index.tsx
│   ├── AgenciesDetail<Section>/index.tsx
│   ├── AgenciesDetailForm.context.tsx
│   ├── use-agencies-detail-agency-id.ts
│   └── use-agencies-detail-data.ts
├── create/
│   ├── AgenciesCreate.modal.tsx
│   ├── AgenciesCreate/index.tsx
│   ├── AgenciesCreateHeader/index.tsx
│   ├── AgenciesCreate<Section>/index.tsx
│   └── AgenciesCreateForm.context.tsx
└── shared/
    └── use-agencies-<entity>-data.ts   ← option lists reused by filters and selects
```

Core's older lists keep filters flat beside `AgenciesList/`; new work uses `filters/` and `table/` as in `modules/operation/apps/frontend/src/components/rides/list`.

## Naming

Every name is prefixed `<Feature><View>` so a file is findable from its symbol alone.

| Thing | File | Export |
|---|---|---|
| Component | `AgenciesDetailHeader/index.tsx` | `export function AgenciesDetailHeader()` |
| Data hook | `use-agencies-list-data.ts` | `useAgenciesListData(): UseAgenciesListDataReturnType` |
| ID hook | `use-agencies-detail-agency-id.ts` | `useAgenciesDetailAgencyId()` → `{ agencyId }` |
| Filter hook | `AgenciesListFilterSearch/use-agencies-list-filter-search.ts` | `useAgenciesListFilterSearch()` |
| Form context | `AgenciesDetailForm.context.tsx` | `useAgenciesDetailFormContext`, `AgenciesDetailFormContextProvider` |
| Modal | `AgenciesCreate.modal.tsx` | `openAgenciesCreateModal`, `closeAgenciesCreateModal` |
| Cell | `table/AgenciesListCellName/index.tsx` | `AgenciesListCellName({ value }: { value: Agency['name'] })` |

Every hook declares a `Use<Name>ReturnType` interface and returns a `useMemo` object.

## Sources of truth

- **URLs**: `PAGE_ROUTES.<module>.X_LIST` / `X_DETAIL(id)` and `API_ROUTES.<module>.X_*` from `@tmlmobilidade/consts`. The file is generated: after adding a `page.tsx` or an API `routes.ts`, run `npm run repo:routes` at the repo root and the key appears (see the `go-architecture` skill).
- **Entity, DTO, schema**: `@tmlmobilidade/go-types-<module>` (`Agency`, `UpdateAgencyDto`, `UpdateAgencySchema`, `CreateAgencySchema`).
- **List item types**: `@tmlmobilidade/go-<module>-pckg-types` (`AgenciesListItem`, `UsersOrganizationItem`), defined in `modules/<module>/packages/types/src/<feature>/`.
- **UI**: everything from `@tmlmobilidade/ui`. Icons from `@tabler/icons-react`.
- **Permissions**: `hasPermission(meData?.permissions, { action, scope })` in hooks; `<HasPermission action={PermissionCatalog.all.x.actions.y} scope={PermissionCatalog.all.x.scope}>` around buttons.
- **Navigation**: always `router.push(keepUrlParams(PAGE_ROUTES...))` so active filters survive.

## Data hooks

One SWR hook per fetch. Shape is fixed:

```ts
export function useAgenciesDetailData(): UseAgenciesDetailDataReturnType {
	//

	//
	// A. Setup variables

	const { agencyId } = useAgenciesDetailAgencyId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<Agency>>(API_ROUTES.core.AGENCIES_DETAIL(agencyId), {
		fetcher: async (url: string) => await fetchApiData<Agency>({ url }),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// C. Return data

	return useMemo(() => ({
		data: data?.data,
		error: error?.error,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp,
	}), [data?.data, data?.timestamp, error, isLoading, isValidating, mutate]);
};
```

- List hooks read every filter hook in section A. Small collections filter client-side with `useSearch({ accessors, data, query })`. Large collections build a `query` object with `useMemo` and POST it: SWR key `[url, query]`, fetcher `fetchApiData({ body: query, method: 'POST', url })`.
- `shared/use-<feature>-<entity>-data.ts` hooks also return `ids: string[]` and `options: SelectDataItem[]` for filters and selects.
- The ID hook reads `useParams`, applies `decodeURIComponent`, and is the only place a route param is read.

## Detail view

`XDetailForm.context.tsx` owns fetching, the form, the actions and the capabilities. Components only consume it.

```tsx
const AgenciesDetailFormContext = createContext<StandardFormContextValue<UpdateAgencyDto> | undefined>(undefined);

export function useAgenciesDetailFormContext() {
	const context = useContext(AgenciesDetailFormContext);
	if (!context) throw new Error('useAgenciesDetailFormContext must be used within a AgenciesDetailFormContextProvider');
	return context;
}

export function AgenciesDetailFormContextProvider({ children }: PropsWithChildren) {
	// A. Setup variables: id hook, useMeData, list mutate, detail data
	// B. Setup form: useStandardForm<UpdateAgencyDto, typeof UpdateAgencySchema>({ apiData, schema })
	// C. Handle actions: one useHandleAction per action; onSuccess → form.reset(response.data); detailMutate(response); listMutate();
	// D. Setup flags: hasPermission(...) per action, then useStandardFormCapabilities({ form, loading, update, delete, locked })
	// E. Return state: useMemo → { actions, capabilities, form, isDirty, isValid, status, unblock }
}
```

- `XDetail` renders `<Pane header={[<XDetailHeader key="header" />]} isLoading={isLoading}>` with one `XDetail<Section>` per section.
- `XDetailHeader` is a `Toolbar`: `CloseButton` (push to the list route), `IdTag`, `Label` showing a `useStandardFormWatch` value, `Spacer`, then `UpdateButton` / `LockButton` / `DeleteButton` each inside `HasPermission`, wired to `capabilities.xEnabled`, `status.isX`, `actions.x`.
- A section is `Collapsible` (title and description from i18n) → `Section` → `Grid columns="abc"` → `StandardFormController` per field. Inputs take `readOnly={!capabilities.editEnabled}`, `withAsterisk={!Schema.shape.field.isOptional()}`, `maxLength={Schema.shape.field.maxLength}`, `error={fieldState.error?.message}`.

## Create view

Same context shape with `useStandardForm({ schema })` and no `apiData`. The `create` action's onSuccess: close the modal, `form.reset()`, `unblock()`, list `mutate()`, push to the new item's detail route. `XCreate.modal.tsx` holds a `MODAL_ID` constant and `openXCreateModal` / `closeXCreateModal` built on `openModal` / `closeModal` (`padding: 0`, `size: 'xl'`, `withCloseButton: false`). The list header's "new" `Button` calls `openXCreateModal`; `XCreateHeader` has `CloseButton` → `closeXCreateModal` and a `CreateButton`.

## List view

- `XList` renders `<Pane header={[<XListHeader key="header" />, <XListFiltersBar key="filters" />]}>`, an `ErrorDisplay` when `error`, then `DataTable` with `columns: DataTableColumn<Item>[]` (`accessor`, `title` from i18n, `width`, optional `render`), `rowIdAccessor="_id"`, `selectedId` from the detail ID hook, `onRowClick` pushing to the detail route.
- `XListHeader` is a `Toolbar`: `Label size="lg" caps`, `LoadingActivity` fed by the list hook, `Spacer`, `XListFilterSearch`, then `XListHeaderMenu` or a create `Button`.
- `XListHeaderMenu` builds a permission-gated action array in `useMemo` and renders `ToolbarActions`.
- Custom cells go in `table/XListCell<Name>` and take the raw field as `value`.

### Filters

Filter state lives in the URL. Each filter is a folder with the component and its hook; the list data hook reads filter values through those hooks.

| Kind | Hook | Component |
|---|---|---|
| Text search | `useFilterStateText('search')` | `SearchField onChange={f.set} value={f.value}` |
| Multi-select | `useFilterStateList(key, defaultIds, options)` | `ListFilter active={f.isActive} onChange={f.set} options={f.options} isMultiple withToggleAll` |
| Toggle | `useFilterStateToggle(key)` | `ToggleFilter active={f.value} onToggle={f.toggle}` |
| Date range | `useFilterStateDateRange(key, defaultStart, defaultEnd)` | `DateRangeFilter active={f.isActive} startDate={f.value_start} endDate={f.value_end} onStartDateChange={f.setStart} onEndDateChange={f.setEnd}` |

The hook carries a JSDoc line naming the filter and returns the ui package's `UseFilterState<Kind>ReturnType`. Options for enum filters map `<Enum>Values` through `t('shared:status.<enum>.<value>')`; options for entity filters come from a `shared/` data hook. `XListFiltersBar` lists every filter inside `FiltersBar`.

## i18n

Keys mirror the component tree: `default:<feature>.<view>.<Component>.<part>`, for example `default:agencies.detail.SectionBasicInfo.fields.name.label` or `default:users.list.Header.NewUserButton.label`. Add every key to both `pt.json` and `es.json` under `src/i18n/namespaces/default/`. Portuguese is the primary language. Shared keys come from `shared:`.

## Do not

Each line names a shortcut seen in older code or tempting under time pressure, and the convention that replaces it.

- **No visual content in `app/`.** A page renders one component (plus its provider); markup, `t()` strings beyond the placeholder, and data fetching move to `components/`.
- **No `@mantine/*`, `nuqs` or raw `fetch` imports in a module frontend.** Use the wrappers from `@tmlmobilidade/ui`: components, `fetchApiData`, `useFilterState*`, `useSearch`.
- **No hardcoded URLs, no hand edits to `app-routes.ts`.** Every page and API URL is a generated `PAGE_ROUTES` / `API_ROUTES` key; run `npm run repo:routes` to produce it.
- **No `router.push(url)` without `keepUrlParams`.** Filter state lives in the URL and is lost otherwise.
- **No `useParams` / `useSearchParams` / `useQueryState` inside components or data hooks.** Route params go through the `use-<feature>-detail-<entity>-id.ts` hook; filter state goes through the filter hooks.
- **No `useSWR` inside a component.** Fetching lives in a `use-<feature>-<view>-data.ts` hook with the standard return shape; components consume it.
- **No `useState` form state, no bare `react-hook-form`.** Forms are `useStandardForm` inside a `Form.context.tsx`; fields render through `StandardFormController`.
- **No hand-rolled `isReadOnly` / `canSave` booleans.** Derive them with `useStandardFormCapabilities` and expose them as `capabilities.xEnabled`.
- **No direct `fetchApiData` calls in event handlers.** Wrap every mutation in `useHandleAction` so loading state, toasts and error handling stay uniform.
- **No `DetailContextStateTemplate`, `useFlag*` hooks or `useMeContext`.** Those are the previous generation; the current context shape is `StandardFormContextValue` with `useMeData` and `hasPermission`.
- **No permission checks by string literal in JSX.** Wrap buttons in `HasPermission` with `PermissionCatalog.all.<scope>` values.
- **No user-facing strings in code.** Every label, title, description and placeholder is a `t('default:...')` key present in both `pt.json` and `es.json`.
- **No default exports, no two components in one file, no `styles` prop for layout.** Named exports, one folder per component, CSS modules.
- **No generic names.** `Header`, `List`, `useData` are unfindable; every symbol carries the `<Feature><View>` prefix.
- **No `any`, no `@ts-ignore`, no `eslint-disable`.** Fix the type or the rule violation; `npm run lint` must pass unaided.

## Adding a feature: order of work

1. `app/` layout, index page, detail page and loading file, then `npm run repo:routes` so `PAGE_ROUTES` carries the new keys.
2. List item schema in `modules/<module>/packages/types` if the list needs a trimmed shape, then rebuild that package.
3. `shared/` option hooks, then `list/` (data hook, filters, table cells, header, list), then `detail/` (ID hook, data hook, form context, sections, header, detail), then `create/`.
4. i18n keys in both languages.
5. `npm run lint:fix && npm run lint` in the app directory passes clean. The linter sorts imports, object keys and JSX props; write them alphabetically to begin with.
