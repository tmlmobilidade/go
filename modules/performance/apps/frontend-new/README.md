# Performance frontend-new

Replacement Performance UI, currently exposed at `/performance-new` while the application
directories are being swapped. It replaces the topic-first frontend with entity dossiers:
Pulse → Network lines → Line detail (overview, demand, planned supply).

This replacement owns the current Performance API contract. Obsolete endpoints used only by the
previous frontend are removed rather than retained as compatibility aliases.

## Run locally

```bash
# From repo root, with Performance API available
npm run dev --workspace=@tmlmobilidade/go-performance-frontend-new
```

Default port: `51016`.

## Documentation

| Doc | What it covers |
| --- | --- |
| [Visualization data map](../../docs/frontend-new-data-map.md) | Per-widget lineage: ClickHouse facts → refresh → API → client transforms |
| [Implementation plan](../../docs/frontend-new-implementation-plan.md) | Phased refactor: line scope context, endpoint consolidation, dedup |
| [Passenger demand architecture](../../docs/passenger-demand-architecture.md) | Demand facts, queries, API primitives |
| [Ride performance architecture](../../docs/ride-performance-architecture.md) | Ride-performance fact, queries, frontend mapping |
| [Performance product IA](../../docs/performance-refresh.md) | Product vision and screen model |

Start with the **data map** when debugging a chart or deciding where logic belongs.
Start with the **implementation plan** when changing fetch structure or API shape.

## App structure

```text
src/
├── app/                          # Next.js routes
│   ├── page.tsx                  # Pulse
│   └── network/lines/            # Network list + line detail tabs
├── components/                   # Presentational UI by screen
├── contexts/
│   ├── PerformanceFilters.context.tsx
│   ├── DemoData.context.tsx
│   └── Agencies.context.tsx
├── hooks/                        # Data hooks (SWR); target: LineScope.context
├── data/demo-performance.ts      # Synthetic data when ?demo=true
└── utils/                        # Period math, network compose, heatmap grids
```

## Data fetching conventions

- **SWR** via `@tmlmobilidade/ui` `AppProvider` fetcher.
- **Filters in the URL** — period, comparison, operators, demo (`usePerformanceFilterHref`
  preserves them across navigation).
- **Server** owns metric definitions and cross-fact joins.
- **Client** owns chart toggles, formatting, UX thresholds, and grid layout.

### Screen → resource pattern

| Screen | Pattern |
| --- | --- |
| Pulse | Passenger-demand and ride-performance baselines |
| Network lines | Subject resources joined by `composeNetworkLines` |
| Line overview | Lazy demand and ride-performance resources |
| Line demand | `passenger-demand/*` resources composed by widget hooks |
| Line supply | `planned-supply/*` resources composed by widget hooks |

Domain hooks under `src/hooks/passenger-demand` and `src/hooks/planned-supply` own canonical
requests. Every visualization keeps a colocated hook that selects and presents those resources,
so widgets remain independently reusable without screen-shaped API responses.

## Demo mode

Append `?demo=true` or use the flask control in the filter bar. Demo:

- Skips live API for network lines and line detail.
- Uses fixed period `2026-07-01` → `2026-07-31` when enabled.
- Does **not** cover Pulse (always live).

## Related packages

- `@tmlmobilidade/go-types-performance` — response types and Zod schemas
- `@tmlmobilidade/consts` — `API_ROUTES.performance.*`
- `@tmlmobilidade/go-performance-pckg-scripts` — ClickHouse query modules (server)
