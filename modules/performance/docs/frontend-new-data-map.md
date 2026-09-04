# Performance frontend-new: visualization data map

Status: living document
App: `modules/performance/apps/frontend-new`
API: `modules/performance/apps/api`

This document traces each visualization from its **ClickHouse fact** through **refresh
cadence**, **Performance API query**, and **client-side transforms**. Use it when adding a
widget, debugging empty charts, or deciding whether logic belongs on the server or client.

For the implementation plan to reduce redundant fetches, see
[frontend-new-implementation-plan.md](./frontend-new-implementation-plan.md).

## Legend

| Symbol | Meaning |
| --- | --- |
| **S** | Value calculated on the server (ClickHouse query or API composition) |
| **C** | Value derived on the client (presentation, thresholds, formatting) |
| **L0** | Navigation scope: identity, line metadata, period, comparison, locale, demo state |
| **L1** | Reusable metric primitive (should be shared across screens) |
| **L2** | View dossier (tab-specific bundle) |

## End-to-end pipeline

```text
Sources                          Facts (ClickHouse)              Workers
─────────────────────────────────────────────────────────────────────────────
simplified_apex.validations  →   passenger_demand_by_dimensions_by_5_minutes   sync-metrics-realtime (5 min)
                             →   passenger_demand_by_dimensions_by_day         sync-metrics-daily

operation.rides              →   performance.ride_service_by_ride              sync-metrics-realtime (5 min)
  + ride_analysis_*                                                            sync-metrics-daily (reconcile 14d)

operation.rides              →   (line/pattern identity reads)                 on demand at API time
```

Refresh execution uses `metric-refresh-execution` (Redis lock + `performance.metric_refreshes`
lifecycle). Current-day partitions are **provisional**; closed dates are reconciled on a
rolling window (14 days for ride performance; 7 recent days for passenger-demand daily).

Timezone for operational dates and hour bucketing: **Europe/Lisbon**.

### Analytics trust metadata (target: Phase 0.5)

New or changed analytical reads return `AnalyticsReadResult<TData>`. Its metadata identifies:

- metric `definition_version`;
- `data_status` (`provisional`, `reconciled`, or `mixed`);
- fact `refreshed_at` and optional `source_watermark`;
- resolved period, grain, and `Europe/Lisbon` timezone.

Existing reads migrate incrementally. A composed response keeps trust metadata per subject slice;
demand and ride performance must not appear to share one refresh state when they do not.

---

## Shared filter model

All screens read filters from URL query state via `PerformanceFiltersContext`:

| Filter | Query param | Affects |
| --- | --- | --- |
| Period | `period`, `start_date`, `end_date` | All metrics |
| Comparison | `comparison` | Comparison window or baseline mode |
| Operators | `agency_ids` | Network list, pulse |
| Demo | `demo` | Synthetic data; skips live API for line/network screens |

Line screens resolve `lineId` → `{ agency_id, line_id }` via `parsePerformanceNetworkLineId`.

---

## Pulse (`/`)

| Widget | Represents | ClickHouse / source | Refresh | API endpoint | Server | Client |
| --- | --- | --- | --- | --- | --- | --- |
| Demand card | Accepted validations vs weekday baseline median | `passenger_demand_by_dimensions_by_5_minutes` or daily fact for baseline window | 5 min (recent) | `GET /passenger-demand/baseline` | **S** totals, delta, `meta.baseline_sample_size` | **C** formatting, footnote when sample &lt; 8 |
| Service card | Service delivery % vs baseline | `ride_service_by_ride` | 5 min provisional | `GET /ride-performance/baseline-comparison` | **S** | **C** trend display |
| Delays card | Late-start % vs baseline | same | same | same | **S** | **C** inverted trend sentiment |
| Advances card | Early-start % vs baseline | same | same | same | **S** | **C** inverted trend sentiment |

**Hook:** `usePulseData` — 2 parallel SWR calls today.

**Suggestion:** Add demo fixtures. Keep the two reusable baseline reads unless Phase 4 measurements
justify a `GET /pulse/summary` convenience composition through consistency, shared work, or material
latency improvement.

---

## Network lines (`/network/lines`)

| Widget | Represents | ClickHouse / source | Refresh | API endpoint | Server | Client |
| --- | --- | --- | --- | --- | --- | --- |
| Line table: identity | Code, name, operator | `operation.rides` (network query) | n/a (live metadata) | `GET /network/lines` | **S** | **C** operator name map |
| Line table: validations | Period demand + % change | `passenger_demand_by_dimensions_by_5_minutes` | 5 min | `GET /passenger-demand/breakdown?dimension=line` ×2 periods | **S** per-line totals | **C** delta % in `composeNetworkLines` |
| Line table: service / delays / advances | Operational KPIs + pp deltas | `ride_service_by_ride` | 5 min | `GET /ride-performance/by-line` | **S** metrics + deltas | **C** trend chips |
| Line table: coverage | Observed-start / scheduled | same | same | same | **S** `coverage_pct` | **C** display |
| Summary chips | Count below 95% service, &gt;10% delays, avg coverage | Composed rows | — | (derived from above) | — | **C** thresholds |
| needsAttention | Highlight row | — | — | — | — | **C** service &lt; 95 OR delays &gt; 10 |

**Hook:** `useNetworkLinesData` — 4 API calls + `composeNetworkLines`.

**Suggestion:** → `GET /network/lines/summary` (Phase 3), backed by an application-composition
module above the subject-owned network, demand, and ride-performance reads. Preserve per-subject
trust state and partial metric availability. Keep search, sort, and attention policy client-side.

---

## Line detail — scope and reusable resources

`LineScopeContextProvider` owns **L0 only** and persists across line-tab navigation. L1 metrics remain lazy:
each screen requests only the resources it consumes, while equivalent requests reuse canonical SWR
keys. Shared does not mean eagerly fetched by the provider.

Demand, Overview, and Planned Supply use widget-owned data hooks: every meaningful visualization has a colocated
hook that issues the requests and shapes the data it presents. Several hooks may subscribe to the
same SWR string key; SWR shares the cached response while each widget retains independent loading,
error, and presentation state. Canonical request-key builders are deferred for later evaluation in
`TODO.md`. A backend dossier may therefore have several widget subscribers without becoming a
page-level frontend data owner.

| Data slice | Represents | ClickHouse | API | Server | Client |
| --- | --- | --- | --- | --- | --- |
| Line + patterns | Identity, headsigns, origins/destinations | `operation.rides`, `operation.hashed_trips` | `GET /network/lines/{id}` | **S** | **C** labels in tables |
| Demand series (current) | Validations over period | five-minute fact | `GET /passenger-demand/series` | **S** bucketed points + total | **C** chart |
| Demand series (comparison) | Comparison period overlay | five-minute fact | same | **S** | **C** chart |
| Demand hourly | Hour-of-day profile | five-minute fact | `series` with `time_grain=hour` | **S** | **C** peak-hour KPI |
| Demand comparison | Total vs comparison or baseline | five-minute fact | `series` ×2 periods or `baseline` | **S** totals/baseline | **C** period delta or `toPassengerDemandComparison` |
| Operational series | Service / delays / advances over time | `ride_service_by_ride` | `GET /ride-performance/over-time` | **S** % from additive qtys | **C** sparklines |
| Operational comparison | Period comparison or baseline | `ride_service_by_ride` | `comparison` or `baseline-comparison` | **S** | **C** baseline adapter |
| Operational heatmap | Operational DOW × service-hour rates | `ride_service_by_ride` | `GET /ride-performance/heatmap` | **S** rates; target coordinates `operational_day_of_week` + `service_hour` (`4..27`) | Today **C** normalizes calendar positions; target **C** grid mapping + tones only |
| Demand by pattern | Validations per pattern | five-minute fact | `GET /passenger-demand/breakdown?dimension=pattern` | **S** | **C** join to `pattern.code` |
| Operational by pattern | Service/delays/advances per pattern | `ride_service_by_ride` | `GET /ride-performance/by-pattern` | **S** | **C** join to pattern metadata |

---

## Line overview (`/network/lines/[id]`)

| Widget | Represents | API (today) | Server | Client | Suggestion |
| --- | --- | --- | --- | --- | --- |
| Header | Line metadata | `NETWORK_LINES_DETAIL` | **S** | **C** | L0 `LineScopeContext` |
| Demand evolution | Validations time series + comparison | `over-time` ×2, comparison | **S** | **C** chart, average | Reuse lazy demand resource keys with Demand tab |
| Operational preview (3 cards) | Service, delays, advances + sparklines | `over-time`, comparison | **S** | **C** sparklines, progress bars | Lazy overview resources; reuse only when another screen asks the same question and grain |
| Reliability heatmap — validations | Demand by operational DOW × service hour | hourly `over-time` today | Today **S** raw points; target `passenger-demand/heatmap` operational cells | Today **C** aggregates; target **C** grid only | Share canonical heatmap resource with Demand tab |
| Reliability heatmap — service/delays/advances | Operational rates by operational DOW × service hour | `ride-performance/heatmap` | **S** rates + target operational positions | Today **C** normalizes positions; target **C** metric selection + tones | Migrate to shared operational position contract |
| Patterns table | Per-pattern demand + operational | `by-pattern` ×2 | **S** | **C** row join | Lazy breakdown resources; do not add to the L0 provider |

**Hooks:** colocated with Operational Preview, Reliability Heatmap, and Patterns Table. The
Overview dashboard consumes L0 line scope and arranges those widgets without forwarding metric
data through a page-level hook.

---

## Line demand (`/network/lines/[id]/demand`)

### Shared with overview (L1 — reuse canonical resource keys)

| Widget | API | Server | Client |
| --- | --- | --- | --- |
| Evolution chart | `series` ×2 | **S** | **C** |
| KPI: total + trend | series sum vs comparison | **S** qty; **C** delta if summed client-side | Prefer comparison endpoint total |
| KPI: average | total / n points | — | **C** |
| KPI: busiest day/hour | max bucket | — | **C** |
| KPI: peak hour + share | max hour from hourly series | **S** hourly buckets | **C** aggregation |

For `comparable-weekdays`, totals and trends use the baseline-comparison read. Do not request the
current period again as a comparison series or show an overlay until a real baseline time-profile
contract exists.

### Demand-specific resources

| Widget | Represents | ClickHouse tables | API | Server | Client |
| --- | --- | --- | --- | --- | --- |
| Records | Best demand day per day-type (last 12 months) | `passenger_demand_by_dimensions_by_day` | `GET /passenger-demand/records` | **S** | **C** date formatting |
| Composition | Share by ticket category / product | daily fact (category, product_id) | `breakdown?dimension=category|product` ×2 periods | **S** quantities + total | **C** shares, deltas, dimension toggle |
| Contributions — patterns | Top pattern demand vs comparison | five-minute fact | `breakdown?dimension=pattern` ×2 periods | **S** | **C** join and top 8 |
| Contributions — stops | Top stop demand vs comparison | five-minute fact (stop_id) | `breakdown?dimension=stop` ×2 periods | **S**; stop names enriched in API controller via MongoDB | **C** join and top 8 |
| Productivity | Validations per operated ride / per delivered vehicle-km | daily + `ride_service_by_ride` | `GET /passenger-demand/productivity` ×2 periods | **S** | **C** trend % |
| Hourly heatmap | Average demand intensity by operational weekday × service hour | five-minute fact | `GET /passenger-demand/series?time_grain=hour` | **S** points | **C** aggregates and renders grid |

**Query module:** `packages/scripts/src/passenger-demand/queries/resources.ts`

**Data-state note (UI):** products/categories/records use reconciled daily aggregates; stops and
hourly views use five-minute source and may be provisional.

**Hooks:** domain request hooks live under `src/hooks/passenger-demand`; every Demand widget keeps a
colocated hook that composes only the resources it needs.

---

## Line planned supply (`/network/lines/[id]/planned-supply`)

Bounded planned-supply resources composed by independent widget hooks.

| Widget | Represents | ClickHouse | API field | Server | Client |
| --- | --- | --- | --- | --- | --- |
| KPI cards (4) | Scheduled rides, vehicle-km, per active day | `ride_service_by_ride` (scheduled qty/distance) | `/planned-supply/series` ×2 periods | **S** totals | **C** trend % |
| Evolution chart | Daily scheduled rides & km | same | `/planned-supply/series` ×2 periods | **S** | **C** rides vs km toggle |
| Day profiles | Median headway, span, first/last departure by day type | same (departure minutes array) | `/planned-supply/day-profiles` | **S** | **C** day-type selector, time formatting |
| Planning heatmap | Avg scheduled departures by operational weekday × service hour | same | `/planned-supply/time-profile` | **S** canonical operational positions | **C** grid render |
| Patterns table | Rides/km share and delta per pattern | same | `/planned-supply/breakdown` ×2 periods | **S** | **C** labels, sorting |

**Query module:** `packages/scripts/src/ride-performance/queries/by-ride/planned-supply.ts`

**API:** `GET /planned-supply/{summary|series|breakdown|time-profile|day-profiles}`

**Data-state note (UI):** planned supply from published timetable; capacity and seat-km not shown
without defensible vehicle assignment.

**Hooks:** domain request hooks live under `src/hooks/planned-supply`; KPIs, evolution, day profiles,
heatmap, and patterns keep colocated hooks that compose the required resources. The Supply dashboard
consumes L0 line scope and only arranges those widgets.

---

## Metric definitions (server-owned)

### Passenger demand

- **Accepted validations** — statuses defined in `passenger-demand/definition.ts`
- **Unknown dimensions** — filtered when `exclude_unknown=true` (pattern/line `__unknown__`)
- **Over-time grain** — `hour` for single-day periods, `day` for multi-day (client passes via period shape)

### Ride performance

- **Service %** — `(scheduled - execution_failures) / scheduled`
- **Delays %** — `LATE_START` / observed starts (delay-eligible)
- **Advances %** — `EARLY_START` / observed starts
- **Coverage %** — observed starts / scheduled
- Definition version: `ride-performance-v1` in `ride-performance/definition.ts`

Percentages are **never** averaged on the client across patterns or lines; breakdown endpoints
return additive quantities and nullable percentages per row.

---

## Client-side transforms (by utility)

| Utility | Used by | What it does |
| --- | --- | --- |
| `composeNetworkLines` | Network list | Current: joins subject reads and maps agency identity; target: server composition owns data join, thin client adapter owns UX policy |
| `toPassengerDemandComparison` / `toRidePerformanceComparison` | Overview, demand | Adapts baseline API shape to comparison card shape |
| `createDemandHeatmapCells` | Overview heatmap, demand heatmap | Current: buckets hourly points; remove aggregation after `passenger-demand/heatmap` migration |
| `createOperationalHeatmapCells` | Overview heatmap | Current: normalizes calendar cells and selects metric; target: select metric and map canonical operational positions only |
| `getLineHeatmapTone` | Overview heatmap | UX thresholds for service/delays/advances |
| `createMetricTrend` | Most KPI cards | Direction, label, sentiment from delta |
| `formatPeriodRangeLabel` / comparison labels | All line screens | Locale-aware period copy |
| Demo fixtures (`data/demo-performance.ts`) | Demo mode | Synthetic data; not a production data source |

---

## Resource and endpoint map (current → target)

| Current | Screens | Target |
| --- | --- | --- |
| `passenger-demand/series` | Overview, demand | Canonical lazy demand-series resource |
| `passenger-demand/baseline` | Pulse, overview, demand | Canonical baseline resource; comparable-weekdays never requests current as comparison |
| `ride-performance/over-time` | Overview | Lazy operational-series resource |
| `ride-performance/comparison` / `baseline-comparison` | Overview | Lazy operational-comparison resource |
| `ride-performance/heatmap` | Overview | Lazy heatmap resource using canonical operational positions after Phase 2 |
| Subject breakdown resources | Overview, demand, supply | Lazy resources; no L0 provider fetch |
| `network/lines` + demand×2 + ride | Network list | `network/lines/summary` application composition with per-subject trust metadata |
| baseline ×2 | Pulse | Keep unless Phase 4 evidence justifies `pulse/summary` |

---

## Adding a new visualization

1. Name the **question** and **grain** (e.g. "delays by hour for one line").
2. Check if an **L1 primitive** already answers it (see
   [passenger-demand-architecture.md](./passenger-demand-architecture.md),
   [ride-performance-architecture.md](./ride-performance-architecture.md)).
3. If yes: consume it from a data hook colocated with the visualization. Do not add metric fetches
   to `LineScopeContext`.
4. If no: add a named question-shaped query module under the correct fact grain in
   `packages/scripts`, expose one bounded HTTP endpoint, and add a colocated widget data hook.
5. New or changed analytical reads follow the Phase 0.5 trust metadata contract.
6. Prefer **client** only for: formatting, sorting, top-N display, chart type toggles, UX thresholds.
7. Do **not** add a chart-specific endpoint if the same question+grain+dimensions serve multiple
   charts.
8. Use an application-composition module for cross-subject summaries; do not move subject SQL or
   metric definitions into it.

### CSV export

- Use `PerformanceCsvExportButton` for every exportable visualization type.
- Pass flat raw datasets with stable keys; use dataset dimensions to distinguish periods, subjects,
  or tab dimensions.
- Export every available metric and dimension, not only the visible metric or selected tab.
- Pass entity context through generic metadata such as `line_id`, `agency_id`, or `operator_id`.
- Keep a small join beside the widget only when identifiers need domain context. Do not add
  chart-specific export components or translated CSV column headers.

---

## Changelog

| Date | Change |
| --- | --- |
| 2026-08-27 | Flattened Overview into colocated widget hooks and standardized raw CSV exports across visualization types |
| 2026-08-27 | Reworked Demand, Overview, and Planned Supply into colocated, widget-owned data hooks and deferred canonical key builders |
| 2026-08-26 | Refined Phase 1 Demand into direct visualization consumption of `useLineDemand` plus a separate dashboard hook |
| 2026-08-26 | Implemented Phase 1 persistent L0 line scope and canonical lazy resource hooks |
| 2026-08-26 | Aligned map with L0-only scope, lazy resources, trust metadata, canonical heatmap positions, and summary composition |
| 2026-08-26 | Initial map for pulse, network lines, line overview/demand/supply |
