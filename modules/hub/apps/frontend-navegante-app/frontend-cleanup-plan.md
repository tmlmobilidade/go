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
├── common/                   # Shared route presentation components
├── input/                    # Origin, destination, search, and time input
├── list/                     # Results, filtering, sorting, and itinerary cards
├── detail/                   # Itinerary and place detail
├── navigation/               # Active-trip guidance surfaces
└── planner/                  # Workflow composition root
```

The migration happens while components are split, avoiding a directory-wide move-only change.

## Target source-support structure

Hooks and utilities are grouped by the domain knowledge they own. Shared types and constants live in themed support folders instead of accumulating beside components, while automated tests live outside the production source tree. Component feature folders should primarily contain rendered components and their styles.

```text
src/hooks/
├── base-map/               # Base-map derived data, camera, and interactions
├── bottom-sheet/           # Shared sheet state and map-aware behavior
├── route-planner/          # Route-planning data and workflow hooks
├── search/                 # Shared search/geocoding hooks
└── transit/                # Operational-date and selected-trip hooks

src/utils/
├── alerts/                  # Alert presentation and filtering helpers
├── bottom-sheet/            # Shared sheet behavior
├── map/                     # Base-map data, operator visibility, and map helpers
├── route-planner/
│   ├── itinerary/           # Itinerary enrichment, geometry, and progress
│   ├── planning/            # Locations, planning API, results, and transitions
│   └── presentation/        # Formatting and mode presentation
├── search/                  # Text normalization and search helpers
└── transit/                 # Shared timetable, stop, and pattern helpers

src/constants/
├── bottom-sheet.ts          # Cross-component sheet constants
└── map.ts                   # Map defaults and style configuration

src/types/
├── api/                     # Hub API response contracts
├── common/                  # One-off shared app contracts
├── motis-api/               # Generated MOTIS API contracts
└── route-planner/           # Route models and context facade

tests/
├── common/                  # One-off bottom-sheet, map, and search tests
└── route-planner/           # Route-planning behavior tests
```

## Execution plan

Status values: `pending`, `in progress`, `complete`, and `blocked`.

| # | Task | Status | Dependencies | Progress |
|---:|---|---|---|---|
| 1 | Characterize route-planner modes, sorting, travel-time parameters, location mapping, and navigation transitions | complete | — | Covered mode normalization/filtering, last-mode protection, all sort modes, now/departure/arrival parameters, geocode/stop/coordinate mapping, and existing pure navigation transitions. |
| 2 | Characterize map operator normalization and alert/vehicle filtering order | complete | — | Covered CM grouping, known/unknown agency visibility, itinerary selection, focused overrides, line-pattern overrides, and final operator filtering. |
| 3 | Characterize active-leg selection, walking progress, geometry, and first-leg fitting | complete | — | Covered nearest-path selection, no-position and empty-itinerary fallbacks, walking distance/time, decoded and endpoint-fallback geometry, and first-leg fitting. |
| 4 | Extract shared route presentation primitives | complete | 1 | Added `RoutePlannerModeIcon`, `MotisLegModeKind`, pure mode normalization, and `useLinesByShortName`; migrated detail, leg strip, and live bar. |
| 5 | Extract shared search and location utilities | complete | 1 | Shared Hub-stop and current-coordinate location factories, accent/case-insensitive text normalization, and local datetime-input formatting; migrated route input, route context, route results, and Search. |
| 6 | Split itinerary detail and leg-strip components | complete | 4 | Moved itinerary detail into `detail`; extracted detail legs and badges; moved the shared leg strip into `common`; extracted strip items and line pills with one named component per folder. |
| 7 | Split route results and extract pure filtering/sorting | complete | 1 | Pure mode filtering, last-mode protection, and sorting are extracted; results orchestration, filter toggles, mode/sort/time panels, and itinerary cards now have focused components under `list`. |
| 8 | Split route input and Search presentation | complete | 5 | Added one shared debounced MOTIS geocode hook while keeping route stop/coordinate composition and Search grouping/scoring feature-specific; split focused input, location-result, travel-time, and Search presentation components. |
| 9 | Split `route-planner-motis.ts` by responsibility | complete | 1, 3, 5 | Moved types, plan request/response helpers, geocoding, formatting, modes, geometry, and progress into focused modules; retained `route-planner-motis.ts` as a compatibility barrel for existing consumers. |
| 10 | Extract the MOTIS API client and pure transitions from `RoutePlanner.context.tsx` | complete | 9 | Moved context-facing types, the MOTIS plan request, plan-start state, and travel-time-mode state into focused modules with transition coverage; preserved the complete context facade and reduced the provider file from 420 to 367 lines. |
| 11 | Extract BaseMap focused-entity and derived-data hooks | complete | 2, 3 | Moved focused alert/line/stop/vehicle selection, focused geometry, route-specific map enrichment, and final operator filtering into map-owned hooks; reduced `BaseMap` from roughly 500 to 315 lines while preserving filtering precedence. |
| 12 | Extract BaseMap camera synchronization, interactions, and layer composition | complete | 11 | Camera synchronization and map interactions are isolated behind map-owned hooks, render ordering lives in `BaseMapLayers`, and `BaseMap` is now a small composition root that retains one user-location hook instance. |
| 13 | Introduce singleton user-location ownership | in progress | 3 | One root `UserLocationContextProvider` now owns geolocation and orientation subscriptions while the existing hook interface remains compatible; mobile permission and orientation flows still require manual verification. |
| 14 | Consolidate bottom-sheet implementation and add snap behavior coverage | complete | 1 | Removed the legacy handcrafted sheet, made the `react-modal-sheet` adapter the canonical `BottomSheet`, colocated navigation types and shared snap constants, and covered map-interaction collapse and snap-state publication. |
| 15 | Normalize context flags and memoize provider values | complete | 10–14 | Every local context provider now memoizes its value behind stable action/filter facades; boolean flags use `is_`/`has_` snake_case names, and permanently undefined/false flags were removed. |
| 16 | Consolidate route/status design tokens and CSS duplication | in progress | Structural tasks complete | Route mode/status colors now use named Navegante tokens; compact/detail line pills and mode badges share size-aware primitives; filter triggers reuse the option button primitive; route CSS no longer carries fallback hex colors. Automated checks pass, but light/dark and responsive visual regression remains pending because no controllable browser was available. |
| 17 | Reorganize route components into `common`, `input`, `list`, `detail`, `navigation`, and `planner` | complete | 4, completed alongside 6–8 | `common` owns shared time/mode/leg presentation, `input` owns endpoint and travel-time input, `list` owns results/filtering/cards, `detail` owns itinerary and place detail, `navigation` owns trip-start and live-guidance controls, and `planner` owns the workflow composition root. Only the context contract remains at the route root. |
| 18 | Reorganize hooks, utilities, support types/constants, and colocated tests by domain | complete | 9, 11–15 | Grouped standalone hooks under themed folders; grouped utilities under `alerts`, `bottom-sheet`, `map`, `route-planner`, `search`, and `transit`; moved shared sheet and route contracts/constants out of component folders; colocated tests with their modules; updated test discovery; removed the route-planner compatibility barrel and redundant user-location re-export. |
| 19 | Remove unreachable legacy component trees | complete | 17–18 | Audited static source reachability from every Next.js app entry point; removed 13 unreachable components, the list contexts owned only by the obsolete line/stop list trees, and their unreferenced translation keys. A second reachability pass reports no unused component entry points. |
| 20 | Organize map support and normalize search naming | complete | 18–19 | Moved map contexts, contracts, configuration, and style assets out of the component tree so `components/map` contains rendered map modules only. Standardized one `Search` prefix across rendered modules, hooks, contracts, query state, and translation keys. |
| 21 | Normalize type, route utility, and test hierarchies | complete | 18–20 | `src/types` now contains folders only; shared one-off contracts live in `common`, route contracts are grouped together, and the unused duplicate timetable contracts were removed. Route utilities are grouped into `itinerary`, `planning`, and `presentation`, while all tests live under the app-level `tests` tree. No new directory contains only one file. |

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
| 8, 17 | `refactor(hub): split route search components` | Move route input into `input`, separate Search presentation, and share low-level debounced MOTIS geocoding without merging feature-specific result composition. |
| 9 | `refactor(hub): split route planner utilities` | Split the MOTIS catch-all into focused modules while preserving its complete public API through a compatibility barrel. |
| 10 | `refactor(hub): extract route planner services` | Move the MOTIS request, context contract, and tested plan/time transitions out of the provider without changing its public facade. |
| 11 | `refactor(hub): extract base map derived data` | Move focused-entity selection and render-ready route, alert, stop, and vehicle data behind focused map hooks without changing filter order. |
| 12 | `refactor(hub): extract base map camera sync` | Move line, stop, place, and route fitting effects behind a focused camera-synchronization hook. |
| 12 | `refactor(hub): extract base map interactions` | Move click, drag, zoom, and long-press behavior behind one interaction hook without adding a GPS subscriber. |
| 12 | `refactor(hub): extract base map layers` | Move map overlay and path render ordering into a focused layer-composition module. |
| 13 | `refactor(hub): centralize user location ownership` | Replace per-consumer geolocation and orientation subscriptions with one root-owned context while preserving the existing hook interface. |
| 14 | `refactor(hub): consolidate bottom sheet implementation` | Remove the legacy sheet, expose the snap-capable adapter through one canonical component, and cover its shared snap behavior. |
| 15 | `refactor(hub): normalize network context values` | Normalize alerts, lines, and stops loading flags, remove permanently undefined errors, and stabilize their provider values and actions. |
| 15 | `refactor(hub): stabilize realtime map contexts` | Memoize vehicles, vehicle detail, trip updates, and map providers; normalize realtime flags and remove the map's permanently false loading flag. |
| 15 | `refactor(hub): stabilize list context values` | Memoize alerts, lines, and stops list providers behind stable filter/action facades and normalize their local loading flags without changing the shared UI template. |
| 15 | `refactor(hub): stabilize detail context values` | Memoize line, stop, and analytics provider values while stabilizing their exposed actions. |
| 15 | `refactor(hub): stabilize route planner context` | Stabilize the Route Planner action API and memoize its context facade without changing workflow transitions. |
| 16, 17 | `refactor(hub): consolidate route presentation styles` | Centralize route mode/status tokens, share compact/detail mode and line presentation, and reuse filter button styling; visual regression remains tracked. |
| 17 | `refactor(hub): organize remaining route components` | Move place detail, shared time presentation, and active-trip controls into their final route feature folders. |
| 17, 18 | `refactor(hub): organize route planner composition` | Move the workflow composition root into the explicit `routes/planner` category. |
| 18 | `refactor(hub): organize frontend hooks by domain` | Move standalone hooks out of component and flat hook folders into themed support folders. |
| 18 | `refactor(hub): organize frontend support by domain` | Group utilities and adjacent tests by domain, move shared contracts/constants out of component folders, and remove the compatibility barrel. |
| 19 | `refactor(hub): remove unreachable frontend components` | Delete obsolete line/stop list trees and isolated components with no import path from the app. |
| 20 | `refactor(hub): organize map feature support` | Keep rendered map modules in `components/map` while moving shared state, contracts, configuration, and assets to their top-level homes. |
| 20 | `refactor(hub): normalize search feature naming` | Use consistent `Search`-prefixed modules and move shared query state and result contracts out of the component tree. |
| 21 | `refactor(hub): organize frontend type contracts` | Make the type root folder-only, group route contracts, consolidate one-off contracts, and remove unused timetable duplicates. |
| 21 | `refactor(hub): organize route utilities and tests` | Group route utilities by responsibility and move automated tests out of the production utility tree. |

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

Each committed slice has passed its tests, TypeScript check, scoped ESLint, and `git diff --check`. Manual verification remains explicitly tracked for Tasks 13 and 16.
