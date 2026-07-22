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

## Execution plan

Status values: `pending`, `in progress`, `complete`, and `blocked`.

| # | Task | Status | Dependencies | Progress |
|---:|---|---|---|---|
| 1 | Characterize route-planner modes, sorting, travel-time parameters, location mapping, and navigation transitions | complete | — | Covered mode normalization/filtering, last-mode protection, all sort modes, now/departure/arrival parameters, geocode/stop/coordinate mapping, and existing pure navigation transitions. |
| 2 | Characterize map operator normalization and alert/vehicle filtering order | pending | — | Include CM agencies `41`–`44` and unknown agencies. |
| 3 | Characterize active-leg selection, walking progress, geometry, and first-leg fitting | pending | — | — |
| 4 | Extract shared route presentation primitives | complete | 1 | Added `RoutePlannerModeIcon`, `MotisLegModeKind`, pure mode normalization, and `useLinesByShortName`; migrated detail, leg strip, and live bar. |
| 5 | Extract shared search and location utilities | in progress | 1 | Hub-stop location factory is shared by route input and OmniSearch. Text normalization and time-input formatting remain. |
| 6 | Split itinerary detail and leg-strip components | pending | 4 | One named component per folder. |
| 7 | Split route results and extract pure filtering/sorting | in progress | 1 | Pure mode filtering, last-mode protection, and sorting are extracted. Component splitting remains. |
| 8 | Split route input and OmniSearch presentation | pending | 5 | Keep feature-specific composition above shared geocoding. |
| 9 | Split `route-planner-motis.ts` by responsibility | pending | 1, 3, 5 | Move-only modules with temporary compatibility exports where needed. |
| 10 | Extract the MOTIS API client and pure transitions from `RoutePlanner.context.tsx` | pending | 9 | Preserve the current context facade. |
| 11 | Extract BaseMap focused-entity and derived-data hooks | pending | 2, 3 | Preserve filtering order. |
| 12 | Extract BaseMap camera synchronization, interactions, and layer composition | pending | 11 | Separate commits for effects, interactions, and layers. |
| 13 | Introduce singleton user-location ownership | pending | 3 | Verify mobile permission and orientation flows manually. |
| 14 | Clarify bottom-sheet implementations and add snap behavior coverage | pending | 1 | Rename implementations and colocate navigation types/constants before consolidation. |
| 15 | Normalize context flags and memoize provider values | pending | 10–14 | Use small consumer-safe migrations. |
| 16 | Consolidate route/status design tokens and CSS duplication | pending | Structural tasks complete | Requires visual regression coverage. |
| 17 | Reorganize route components into `common`, `input`, `list`, `detail`, and `navigation` | in progress | 4, completed alongside 6–8 | `common/RoutePlannerModeIcon` establishes the structure. Remaining moves occur with component extraction. |

## Commit log

| Tasks | Commit | Summary |
|---|---|---|
| 1, 4, 17 | `refactor(hub): extract shared route presentation primitives` | Characterize mode normalization and extract shared route presentation primitives. |
| 1, 5, 7 | `test(hub): characterize route planning behavior` | Cover route result selection, request parameters, and location mapping through pure seams. |

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

The first completed slice passed its tests, TypeScript check, scoped ESLint, and `git diff --check`.
