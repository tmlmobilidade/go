# Frontend Navegante cleanup execution plan

Last updated: 2026-07-22

This document tracks the behavior-preserving cleanup of `frontend-navegante-app`. The source assessment and product regression checklist remain in the external cleanup handoff. MOTIS API background remains in `motis-ui-handoff.md`.

## Working agreement

- Preserve product behavior and public component/context APIs unless a task explicitly migrates consumers.
- Keep every commit compiling and independently reviewable.
- Commit after each coherent group of one to three completed tasks.
- Update this document in the commit that changes a task's status.
- Do not edit generated MOTIS API files.
- Do not combine route state, map fitting, GPS ownership, and bottom-sheet changes in one commit.
- Run automated checks for every commit and use the manual regression checklist for behavior-sensitive tasks.

## Target route structure

The route feature needs an `input` area in addition to the `common`, `list`, and `detail` structure used by other domains. Endpoint selection and travel-time controls do not naturally belong to either results or detail.

```text
src/components/routes/
├── RoutePlanner.context.tsx
├── RoutePlanner/             # Workflow composition root
├── common/                   # Shared route presentation components
├── input/                    # Origin, destination, search, and time input
├── list/                     # Results, filtering, sorting, and itinerary cards
├── detail/                   # Itinerary and place detail
└── navigation/               # Active-trip guidance surfaces
```

The migration happens while components are split, avoiding a directory-wide move-only change.

## Target utility structure

Utilities will be grouped by the domain knowledge they own, with tests colocated beside the module they verify. Colocation keeps the implementation and its test surface together while the domain folders make the utility interface easier to navigate.

```text
src/utils/
├── alerts/                  # Alert presentation and filtering helpers
├── map/                     # Base-map data, operator visibility, and map helpers
├── route-planner/           # MOTIS adapters and route-planning domain logic
├── search/                  # Text normalization and search helpers
└── transit/                 # Shared timetable, stop, and pattern helpers
```

## Execution plan

Status values: `pending`, `in progress`, `complete`, and `blocked`.

| # | Task | Status | Dependencies | Progress |
|---:|---|---|---|---|
| 1 | Characterize route-planner modes, sorting, travel-time parameters, location mapping, and navigation transitions | complete | — | Covered mode normalization/filtering, last-mode protection, all sort modes, now/departure/arrival parameters, geocode/stop/coordinate mapping, and existing pure navigation transitions. |
| 2 | Characterize map operator normalization and alert/vehicle filtering order | complete | — | Covered CM grouping, known/unknown agency visibility, itinerary selection, focused overrides, line-pattern overrides, and final operator filtering. |
| 3 | Characterize active-leg selection, walking progress, geometry, and first-leg fitting | complete | — | Covered nearest-path selection, no-position and empty-itinerary fallbacks, walking distance/time, decoded and endpoint-fallback geometry, and first-leg fitting. |
| 4 | Extract shared route presentation primitives | complete | 1 | Added `RoutePlannerModeIcon`, `MotisLegModeKind`, pure mode normalization, and `useLinesByShortName`; migrated detail, leg strip, and live bar. |
| 5 | Extract shared search and location utilities | complete | 1 | Shared Hub-stop and current-coordinate location factories, accent/case-insensitive text normalization, and local datetime-input formatting; migrated route input, route context, route results, and OmniSearch. |
| 6 | Split itinerary detail and leg-strip components | complete | 4 | Moved itinerary detail into `detail`; extracted detail legs and badges; moved the shared leg strip into `common`; extracted strip items and line pills with one named component per folder. |
| 7 | Split route results and extract pure filtering/sorting | complete | 1 | Pure mode filtering, last-mode protection, and sorting are extracted; results orchestration, filter toggles, mode/sort/time panels, and itinerary cards now have focused components under `list`. |
| 8 | Split route input and OmniSearch presentation | complete | 5 | Added one shared debounced MOTIS geocode hook while keeping route stop/coordinate composition and OmniSearch grouping/scoring feature-specific; split focused input, location-result, travel-time, and OmniSearch presentation components. |
| 9 | Split `route-planner-motis.ts` by responsibility | complete | 1, 3, 5 | Moved types, plan request/response helpers, geocoding, formatting, modes, geometry, and progress into focused modules; retained `route-planner-motis.ts` as a compatibility barrel for existing consumers. |
| 10 | Extract the MOTIS API client and pure transitions from `RoutePlanner.context.tsx` | complete | 9 | Moved context-facing types, the MOTIS plan request, plan-start state, and travel-time-mode state into focused modules with transition coverage; preserved the complete context facade and reduced the provider file from 420 to 367 lines. |
| 11 | Extract BaseMap focused-entity and derived-data hooks | complete | 2, 3 | Moved focused alert/line/stop/vehicle selection, focused geometry, route-specific map enrichment, and final operator filtering into map-owned hooks; reduced `BaseMap` from roughly 500 to 315 lines while preserving filtering precedence. |
| 12 | Extract BaseMap camera synchronization, interactions, and layer composition | complete | 11 | Camera synchronization and map interactions are isolated behind map-owned hooks, render ordering lives in `BaseMapLayers`, and `BaseMap` is now a small composition root that retains one user-location hook instance. |
| 13 | Introduce singleton user-location ownership | in progress | 3 | One root `UserLocationContextProvider` now owns geolocation and orientation subscriptions while the existing hook interface remains compatible; mobile permission and orientation flows still require manual verification. |
| 14 | Consolidate bottom-sheet implementation and add snap behavior coverage | complete | 1 | Removed the legacy handcrafted sheet, made the `react-modal-sheet` adapter the canonical `BottomSheet`, colocated navigation types and shared snap constants, and covered map-interaction collapse and snap-state publication. |
| 15 | Normalize context flags and memoize provider values | pending | 10–14 | Use small consumer-safe migrations. |
| 16 | Consolidate route/status design tokens and CSS duplication | pending | Structural tasks complete | Requires visual regression coverage. |
| 17 | Reorganize route components into `common`, `input`, `list`, `detail`, and `navigation` | in progress | 4, completed alongside 6–8 | `common` owns shared mode/leg-strip presentation, `input` owns endpoint fields, location results/selectors, time input, and top search, `detail` owns itinerary detail, and `list` owns results, filters, and itinerary cards. Place detail, navigation, and remaining shared/root moves remain. |
| 18 | Reorganize the flat `utils` directory by domain and keep tests colocated | pending | 9, 11–13 | Move route-planner, map, search, alert, and shared transit utilities into focused folders after behavior-sensitive extractions stop changing their imports; avoid compatibility files that recreate the flat directory. |

## Commit log

| Tasks | Commit | Summary |
|---|---|---|
| 1, 4, 17 | `refactor(hub): extract shared route presentation primitives` | Characterize mode normalization and extract shared route presentation primitives. |
| 1, 5, 7 | `test(hub): characterize route planning behavior` | Cover route result selection, request parameters, and location mapping through pure seams. |
| 2, 11 | `test(hub): characterize map filtering order` | Cover operator normalization and alert/vehicle filter precedence through pure seams. |
| 3 | `test(hub): characterize active route progress` | Cover active-leg selection, walking progress, geometry fallback, and fitting through a pure progress seam. |
| 5 | `refactor(hub): consolidate route search utilities` | Centralize text normalization, current-coordinate location mapping, and datetime-input formatting without changing consumer behavior. |
| 6, 17 | `refactor(hub): split route itinerary components` | Give itinerary detail and shared leg-strip presentation one named component per folder under the target route structure. |
| 7, 17 | `refactor(hub): split route results components` | Move route results into `list` and separate filtering, sorting, time controls, and itinerary cards into focused components. |
| 8, 17 | `refactor(hub): split route search components` | Move route input into `input`, separate OmniSearch presentation, and share low-level debounced MOTIS geocoding without merging feature-specific result composition. |
| 9 | `refactor(hub): split route planner utilities` | Split the MOTIS catch-all into focused modules while preserving its complete public API through a compatibility barrel. |
| 10 | `refactor(hub): extract route planner services` | Move the MOTIS request, context contract, and tested plan/time transitions out of the provider without changing its public facade. |
| 11 | `refactor(hub): extract base map derived data` | Move focused-entity selection and render-ready route, alert, stop, and vehicle data behind focused map hooks without changing filter order. |
| 12 | `refactor(hub): extract base map camera sync` | Move line, stop, place, and route fitting effects behind a focused camera-synchronization hook. |
| 12 | `refactor(hub): extract base map interactions` | Move click, drag, zoom, and long-press behavior behind one interaction hook without adding a GPS subscriber. |
| 12 | `refactor(hub): extract base map layers` | Move map overlay and path render ordering into a focused layer-composition module. |
| 13 | `refactor(hub): centralize user location ownership` | Replace per-consumer geolocation and orientation subscriptions with one root-owned context while preserving the existing hook interface. |
| 14 | `refactor(hub): consolidate bottom sheet implementation` | Remove the legacy sheet, expose the snap-capable adapter through one canonical component, and cover its shared snap behavior. |

## Verification

Required automated checks:

```bash
npm test -w @tmlmobilidade/go-hub-frontend-navegante-app
npx tsc --noEmit -p modules/hub/apps/frontend-navegante-app/tsconfig.json
git diff --check
```

Run ESLint from the app workspace so dependency resolution uses the correct package:

```bash
cd modules/hub/apps/frontend-navegante-app
npx eslint src
```

Each completed slice has passed its tests, TypeScript check, scoped ESLint, and `git diff --check`.
