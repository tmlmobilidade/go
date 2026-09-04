# Performance frontend-new: data architecture implementation plan

Status: proposed
Scope: `modules/performance/apps/frontend-new`, Performance API read models, shared line scope

## Purpose

Reduce redundant work, clarify the data flow from ClickHouse facts to UI widgets, and
establish a stable balance between:

- **L0 scope** — identity, period, comparison mode, and canonical request identity;
- **L1 metric primitives** — lazily fetched reusable aggregated facts (series, breakdowns,
  heatmaps, comparisons);
- **L2 view dossiers** — tab-specific bundles for complex analyst views.

The reference pattern is **planned supply**: one scoped dossier endpoint, server owns
aggregation, client owns presentation toggles. The main counterexample is **line
overview**: many granular endpoints for one screen, with overlap into the demand tab.

The objective is not to minimise HTTP request count in isolation. Optimisation decisions
must consider duplicate ClickHouse work, payload size, cache reuse, navigation behaviour,
loading independence, and whether a server response represents a stable domain concept.

See [frontend-new data map](./frontend-new-data-map.md) for the per-widget lineage from
ClickHouse through API to client transforms.

See [frontend-new request baseline](./frontend-new-request-baseline.md) for the Phase 0 request
inventory and the reproducible before/after capture procedure.

## Principles

1. **One primitive per question at a given grain** — not one endpoint per chart.
2. **Server owns definitions** — service %, productivity, baseline comparison, heatmap buckets.
3. **Client owns presentation** — metric toggles, sparklines, trend arrows, heatmap tone, thresholds.
4. **Shared scope, tab-specific dossiers** — overview and demand share L1 primitives; demand and
   supply tabs add L2 dossiers only when needed.
5. **Preserve additive facts** — percentages and ratios are derived at read time from numerators
   and denominators, never averaged across entities on the client.
6. **Lazy by default** — sharing a scope or cache key must not make unrelated tabs fetch data they
   do not consume.
7. **Measure before bundling** — fewer HTTP calls are not automatically faster or simpler; add a
   bundle only when it removes meaningful server composition, consistency, or latency problems.
8. **Bounded contracts** — prefer a small set of explicit domain grains over an endpoint that
   accepts arbitrary metric and grouping combinations.
9. **Visible trust state** — analytical values carry enough metadata to identify their definition,
   freshness, period, and provisional or reconciled state.

## Target architecture

```text
ClickHouse facts
        |
        v
L1 metric primitives (Performance API)
        |
        +--> Colocated widget data hooks
        |         |
        |         +--> Overview tab
        |         +--> Demand tab (+ demand dossier)
        |         `--> Supply tab (+ supply dossier only)
        |
        +--> network/lines/summary (list screen)
        `--> evidence-gated convenience bundles

LineScopeContext (L0 only)
        |
        `--> identity + line metadata + periods + comparison mode

Cross-cutting read contract
        `--> definition version + freshness + data state + resolved period/grain/timezone
```

## Phase 0 — Baseline and measurement

**Goal:** Establish the current request baseline and make comparison semantics consistent before
moving ownership between hooks and contexts.

### Tasks

1. Record, for overview → demand → supply → overview navigation:
   - unique request keys and revalidations;
   - response sizes and timings;
   - repeated ClickHouse queries;
   - requests whose data is never consumed by the active tab.
2. Add tests for canonical request construction so equivalent filters produce the same SWR key.
3. Make `comparable-weekdays` behaviour explicit on line detail:
   - current-period series remains available;
   - KPI totals and trends use the baseline-comparison endpoint;
   - do not request the current period again as a fake comparison series;
   - do not show a comparison overlay until the API has a real baseline time-profile contract.
4. Document the comparison policy in the data map and in user-facing chart states.

### Acceptance criteria

- The before-state is captured with reproducible navigation scenarios.
- Comparable-weekdays never produces a current-vs-current delta or mislabeled overlay.
- Later phases can be evaluated against query cost, payload, and navigation behaviour rather than
  request count alone.

---

## Phase 0.5 — Minimal analytics trust contract

**Goal:** Make analytical values auditable without introducing a full metric catalogue or query
platform before it is needed.

### Contract

Add a shared response interface in `@tmlmobilidade/go-types-performance`:

```ts
interface AnalyticsReadResult<TData> {
	data: TData
	meta: {
		data_status: 'mixed' | 'provisional' | 'reconciled'
		definition_version: string
		refreshed_at: number
		resolved_grain?: string
		resolved_period: { end_date: number, start_date: number }
		source_watermark?: number
		timezone: 'Europe/Lisbon'
	}
}
```

`refreshed_at` describes fact publication time; `source_watermark`, when available, describes the
latest source event included. They must not be treated as interchangeable.

### Tasks

1. Add and test the shared metadata and response schemas.
2. Define how each canonical fact resolves `data_status`, `refreshed_at`, and
   `source_watermark` for a requested period.
3. Adopt the contract first on new or changed reads from Phases 2 and 3.
4. Migrate existing primitives incrementally when they are next modified; do not block Phase 1 on
   converting every existing endpoint.
5. For a composed response, preserve metadata per subject slice rather than presenting demand and
   ride performance as if they shared one refresh state.
6. Pass metadata through frontend resource hooks so screens can show provisional or stale data
   honestly when the design calls for it.

### Acceptance criteria

- A developer can identify the definition version, data state, resolved period, timezone, and fact
  refresh time for every newly introduced analytical response.
- A composed response does not collapse different subject freshness states into one timestamp.
- Existing consumers can migrate incrementally without a big-bang response rewrite.

---

## Phase 1 — Minimal line scope and lazy shared resources (frontend only)

**Goal:** Reuse line identity and metric cache entries across tabs without eagerly loading the
entire overview dataset.

**Status:** Completed on 2026-08-27. The implementation keeps line metadata in the persistent L0
context. Demand, Overview, and Planned Supply widgets own colocated data hooks that fetch and shape
the data they present; SWR shares responses when independently constructed string keys match.

### Tasks

1. Add `app/network/lines/[lineId]/layout.tsx` with a small `LineScopeContextProvider`.
2. Keep only L0 data in the provider:
   - parsed `{ agency_id, line_id }` identity;
   - line detail and pattern metadata;
   - period and comparison configuration;
   - locale and demo state;
   - stable inputs from which widgets construct their request keys.
3. Do **not** fetch demand series, operational series, comparisons, heatmaps, or breakdowns in the
   provider.
4. Co-locate data ownership with each meaningful dashboard widget. A widget hook may issue more
   than one request when its visualization combines resources, and it returns presentation-ready
   data plus local loading/error state. The implementation includes:
   - `LineDemandEvolution/useLineDemandEvolutionData`;
   - `LineDemandKpis/useLineDemandKpisData`;
   - `LineDemandHeatmap/useLineDemandHeatmapData`;
   - colocated hooks for records, composition, contributions, and productivity;
   - `LineOverviewOperationalPreview/useLineOverviewOperationalPreviewData`;
   - `LineOverviewReliabilityHeatmap/useLineOverviewReliabilityHeatmapData`;
   - `LineOverviewPatternsTable/useLineOverviewPatternsTableData`;
   - colocated hooks for Planned Supply KPIs, evolution, day profiles, heatmap, and patterns.
5. Do not forward Demand data through page hooks. Let SWR deduplicate independent widget requests
   with identical string keys. Canonical key builders are deliberately deferred to `TODO.md` until
   the duplicated construction has been evaluated in practice.
6. Compose Demand widgets from the bounded `passenger-demand/*` resources.
7. Compose Supply widgets from the bounded `planned-supply/*` resources.
8. Preserve demo mode at the same resource boundaries as live data; the provider exposes demo
   scope, while hooks select the appropriate fixtures.

### Acceptance criteria

- Navigating overview → demand → overview reuses equivalent cached primitives and does not issue
  current-vs-current comparison requests.
- Opening planned supply directly does not fetch demand, operational overview, heatmap, or pattern
  resources.
- Loading flags and error boundaries remain per slice.
- No API or ClickHouse changes.

### Estimated touch points

- `src/contexts/LineScope.context.tsx` (new, L0 only)
- `src/app/network/lines/[lineId]/layout.tsx` (new)
- `src/components/line-detail/overview/*/useLineOverview*Data.ts`
- `src/components/line-detail/demand/*/useLineDemand*Data.ts`
- `src/components/line-detail/supply/*/useLineSupply*Data.ts`
- `src/hooks/useLineSupplyData.ts` (removed after moving ownership into Supply widgets)
- `src/hooks/useLineDetailScope.ts` (removed after folding L0 responsibilities into context)
- `TODO.md` for the deferred canonical-key evaluation

---

## Cross-cutting CSV export contract — completed

**Goal:** Make exports predictable and analysis-ready without putting domain semantics inside
low-level chart components or requiring a bespoke export builder per visualization type.

### Contract

1. `PerformanceCsvExportButton` owns download behaviour, global filter metadata, stable headers,
   and filename construction.
2. Widgets pass one or more flat raw datasets. A dataset may add stable dimensions such as
   `period_role`, `subject`, or `composition_dimension`.
3. Exports include every available metric and every widget dimension, independently of the
   currently selected presentation tab or metric.
4. Column headers remain stable data keys and are not translated display labels.
5. Entity metadata is generic. A line-scoped widget supplies `line_id` and `line_code`; future
   agency, operator, or network widgets supply their own keyed metadata without changing the
   shared component.
6. Widgets may perform a small local join when a raw identifier needs stable domain context, such
   as pattern code, origin, or destination. This does not justify a visualization-specific export
   component.
7. Unsupported comparison fields are omitted in baseline mode rather than exporting the dossier's
   internal identical-period fallback as a meaningful delta.

### Verification

- Pure tests cover dataset flattening, column discovery, metadata precedence, and filenames.
- Planned Supply, Demand, Overview heatmaps/tables, and Network Lines use the same component.
- The previous `usePerformanceCsvExport` hook and visualization-specific CSV builders were removed.

---

## Phase 2 — Canonical operational heatmap primitives (API + frontend)

**Goal:** Give demand and ride performance the same server-owned operational weekday × service
hour coordinates while preserving subject-specific metrics.

### Tasks

1. Define a shared operational heatmap position contract:
   - `operational_day_of_week` uses `1..7`;
   - `service_hour` uses `4..27`, with local hours `0..3` assigned to the previous operational day;
   - timezone is `Europe/Lisbon`, including DST behaviour;
   - missing source data is distinct from an observed zero;
   - each subject extends the shared position with its own additive quantities, denominators, and
     derived metrics.
2. Update the ride-performance heatmap read to return operational positions directly instead of
   calendar weekday plus hour `0..23`.
3. Check existing ride-heatmap consumers before changing the response; use a temporary adapter or
   migration alias if another consumer depends on the calendar-hour shape.
4. Add `GET /passenger-demand/heatmap` over the five-minute fact. Return an
   `AnalyticsReadResult<PassengerDemandHeatmapCell[]>` where:
   - cells carry additive `passenger_demand_qty`, `operational_day_count`, and a server-derived
     `average_passenger_demand` for visual intensity;
   - response metadata follows the Phase 0.5 analytics trust contract.
5. Wire controllers, routes, `API_ROUTES`, and subject-specific cell types in
   `@tmlmobilidade/go-types-performance`.
6. Replace client-side `createDemandHeatmapCells` aggregation on:
   - line overview reliability heatmap (validations metric)
   - line demand hourly heatmap
7. Remove client-side operational-day normalization for ride performance after all consumers use
   the canonical coordinates.
8. Keep client-side grid mapping, metric selection, tones, and formatting only.
9. Add query and normalization tests for both subjects covering the 04:00 boundary, multi-week
   ranges, missing cells, and a Lisbon DST transition.

### Acceptance criteria

- Demand and ride-performance heatmaps use the same operational position contract and
  server/client split.
- Overview and demand heatmaps can share one SWR response when their independently constructed
  request strings match; canonical builders remain a deferred evaluation.
- A date range with an uneven number of weekdays does not bias intensity merely because one
  weekday occurs more often.
- Frontend heatmap modules do not reinterpret calendar timestamps into operational positions.

---

## Phase 3 — Network lines summary read model (API + frontend)

**Goal:** Replace the four-call client join on the network lines screen.

### Tasks

1. Add an application-composition module under the Network HTTP area. It combines existing
   subject read interfaces without importing ClickHouse or redefining their metrics:
   - line identity (`queryPerformanceNetworkLines`)
   - current-period demand by line
   - comparison-period demand by line
   - ride performance by line (current + deltas)
2. Run independent subject reads concurrently and define the failure policy explicitly:
   - line identity is required;
   - an unavailable demand or ride-performance slice does not remove the line rows;
   - unavailable slices are represented as nullable metrics plus per-slice status.
3. Return Phase 0.5 trust metadata separately for demand and ride performance.
4. Move `composeNetworkLines` data joining and agency identity mapping into this composition module.
5. Define a server DTO containing identity and raw current/comparison metrics. Do not include
   `needsAttention` or other UX policy fields.
6. Add `GET /network/lines/summary` as the HTTP adapter for the composition module.
7. Simplify `useNetworkLinesData` to a single SWR call (+ agencies context) and a thin client
   adapter for UX-only fields.
8. Keep client-side search, sort, `needsAttention` thresholds, and summary chips.

### Acceptance criteria

- Network lines list uses one summary endpoint in live mode.
- The composition module calls subject-owned read interfaces; it contains no metric SQL or metric
  definitions.
- A demand or ride-performance failure preserves line identity and the other available slice.
- The response distinguishes server data from client UX policy through a thin adapter.
- Demand and ride-performance freshness remain independently visible.

---

## Phase 4 — Pulse measurement gate + demo parity

**Goal:** Make demo behaviour consistent and decide from evidence whether Pulse needs a bundle.

### Tasks

1. Measure the two parallel baseline-comparison calls on Pulse: latency, payload, ClickHouse work,
   cache behaviour, and partial-failure UX.
2. Keep the existing reusable endpoints if the only benefit of a bundle is reducing two HTTP calls
   to one.
3. Add `GET /pulse/summary` only if it provides a demonstrated benefit such as a consistent
   snapshot, meaningful shared query work, or materially lower latency.
4. If added, implement it as a convenience composition over existing domain query modules; do not
   duplicate metric definitions.
5. Add demo fixtures for pulse (or document that pulse requires live data by design).
6. Show a data-state badge on Pulse when baseline sample size is low (already partially done).

### Acceptance criteria

- The bundle decision and measurements are recorded.
- If no bundle is justified, Pulse retains independent loading and error states for the two domain
  resources.
- If a bundle is justified, numeric results match the existing endpoints and its consistency or
  performance benefit is covered by a test or benchmark.
- Demo toggle behaviour is documented and consistent across pulse, network lines, and line detail.

---

## Phase 5 — Bounded resource API (implemented)

**Goal:** Consolidate proven overlap into stable domain reads without creating an arbitrary
analytics query language.

Only pursue a consolidation when at least two consumers need the same metric, grain, dimensions,
and filter semantics, or when Phase 0 measurements show duplicated ClickHouse work.

### Contracts

```
GET /passenger-demand/series
  ?agency_id & line_id & start_date & end_date
  &time_grain=hour|day
→ chronological passenger-demand buckets

GET /passenger-demand/breakdown
  ?dimension=agency|category|line|pattern|product|stop
  &start_date & end_date & supported subject filters
→ ranked items plus the untruncated additive total

GET /passenger-demand/summary
GET /passenger-demand/baseline
GET /passenger-demand/records
GET /passenger-demand/productivity

GET /planned-supply/series
GET /planned-supply/breakdown
GET /planned-supply/summary
GET /planned-supply/time-profile
GET /planned-supply/day-profiles

GET /ride-performance/series
  ?agency_id & line_id & start_date & end_date
  &time_grain=hour|day
→ chronological additive quantities + service/delay/advance/coverage percentages
```

Heatmaps and entity breakdowns remain separate primitives because their grains are different:

- heatmap: operational weekday × service hour;
- pattern breakdown: pattern for a period;
- line breakdown: line for a period;
- series: chronological time bucket.

Avoid general `metrics` and `group_by` parameters unless a later design demonstrates a finite,
coherent contract for every supported combination.

### Tasks

1. Inventory concrete consumers and write their required question, grain, dimensions, filters, and
   additive quantities.
2. Compare the proposed contract with existing `over-time`, `heatmap`, and breakdown endpoints.
3. Record a design decision to keep, rename, or consolidate each primitive.
4. If consolidation is justified, implement query modules with numeric-equivalence tests.
5. Update lazy resource hooks to call the consolidated primitives.
6. Remove superseded endpoints once the replacement frontend uses the bounded resources. This
   branch is the product cutover and does not retain compatibility aliases for the previous
   frontend.

### Acceptance criteria

- Multiple charts can reuse a primitive when they ask the same domain question at the same grain.
- Unsupported metric/grain/dimension combinations cannot be constructed through the public API.
- No regression in numeric results vs current `over-time` and `heatmap` endpoints.

---

## Phase 6 — Line overview bundle (optional)

**Goal:** Reduce conceptual overhead only if lazy resource hooks still produce measurable latency,
consistency, or maintainability problems.

Only pursue after Phases 1–3 are stable.

```
GET /network/lines/{lineId}/overview
  ?current_* & comparison_* & comparison_mode
→ { demand: {...}, operational: {...} }
```

This is a convenience wrapper over L1 primitives, not a replacement for dossiers. It must not
become the source of metric definitions, and opening another line tab must not trigger it.

---

## What not to change

| Keep as-is | Reason |
| --- | --- |
| Previous dashboard endpoints | Remove when the replacement frontend adopts the bounded resource; no compatibility layer is required |
| Client `needsAttention` thresholds | UX rules, not metric definitions |
| Baseline comparison policy in API | Comparable weekdays is server-owned |
| Demo data module | UI development aid; must not become a second source of truth |
| Independent loading/error state | Preserve unless an evidence-backed bundle requires atomicity |
| Subject-owned query modules | Summary composition calls them; it does not absorb their SQL or definitions |

## Documentation deliverables

| Document | Purpose |
| --- | --- |
| [frontend-new-data-map.md](./frontend-new-data-map.md) | Per-screen widget lineage: ClickHouse → refresh → API → client |
| [frontend-new-request-baseline.md](./frontend-new-request-baseline.md) | Phase 0 unique-key inventory and live navigation capture procedure |
| [apps/frontend-new/README.md](../apps/frontend-new/README.md) | Entry point for frontend developers |

Update the data map when adding a widget or changing a primitive. Update this plan when
completing a phase.

## Suggested implementation order

```text
Phase 0 (baseline)    → measure current flow; fix comparison semantics
Phase 0.5 (trust)     → minimal shared provenance and freshness contract
Phase 1 (lazy scope)  → cache reuse without cross-tab overfetch
Phase 2 (heatmaps)    → one operational coordinate contract across subjects
Phase 3 (net summary) → explicit application composition above subject reads
Phase 4 (pulse gate)  → bundle only if measurements justify it
Phase 5 (primitives)  → bounded consolidation from concrete consumers only
Phase 6 (overview)    → convenience bundle only if still justified
```

## Related docs

- [Passenger demand architecture](./passenger-demand-architecture.md)
- [Ride performance architecture](./ride-performance-architecture.md)
- [Performance V2 architecture refactor](./performance-v2-architecture-refactor.md)
- [Performance product IA](./performance-refresh.md)
