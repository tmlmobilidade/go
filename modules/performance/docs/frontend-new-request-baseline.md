# Performance frontend-new: request baseline

Captured: 2026-08-26
Scope: line overview → demand → planned supply → overview

This is the Phase 0 before-state for evaluating the lazy L0/L1 refactor. It records request
identity from the current hooks and separates unique SWR keys from raw hook invocations.

## Assumptions

- Live mode (`demo=false`).
- The selected line has patterns.
- All requests use the same `{ agency_id, line_id, current period, comparison mode }`.
- A single-day current series already uses `time_grain=hour`; its hourly-profile hook invocation
  resolves to the same SWR key and does not create a second unique request.
- `BaseProvider` refreshes every 10 minutes, revalidates stale data, and revalidates on focus.
- Navigation can revalidate mounted resources; SWR cache reuse does not guarantee zero network
  activity after remount.

## Request inventory

| Resource | Overview | Demand | Supply | Comparable weekdays |
| --- | ---: | ---: | ---: | --- |
| Line identity + patterns | 1 | 1 | 1 | unchanged |
| Demand current series | 1 | 1 | 0 | unchanged |
| Demand comparison series | 1 | 1 | 0 | **disabled** |
| Demand hourly profile | 1 hook invocation | 1 hook invocation | 0 | unchanged; same key as current for single-day |
| Demand period/baseline comparison | 1 | 1 | 0 | baseline endpoint |
| Demand by pattern | 1 | 0 | 0 | unchanged |
| Demand dossier | 0 | 1 | 0 | current values remain; comparison presentation hidden |
| Ride-performance series | 1 | 0 | 0 | unchanged |
| Ride-performance period/baseline comparison | 1 | 0 | 0 | baseline endpoint |
| Ride-performance heatmap | 1 | 0 | 0 | unchanged |
| Ride performance by pattern | 1 | 0 | 0 | unchanged |
| Planned-supply dossier | 0 | 0 | 1 | unchanged |

### Unique-key expectations on direct load

| Screen and mode | Single-day | Multi-day | Notes |
| --- | ---: | ---: | --- |
| Overview, period comparison | 9 | 10 | Multi-day hourly profile is distinct from daily evolution |
| Overview, comparable weekdays | 8 | n/a | Available only for a closed single day |
| Demand, period comparison | 5 | 6 | Includes line identity and L2 dossier |
| Demand, comparable weekdays | 4 | n/a | No comparison-series request or overlay |
| Planned supply | 2 | 2 | L0 line identity + L2 dossier |

These counts describe unique resource keys, not ClickHouse statements inside a dossier. The Demand
dossier currently requires explicit current and comparison periods. In comparable-weekdays mode it
receives the current period for both so it can still return current composition, contribution, and
productivity data; the frontend hides those unsupported comparison deltas. A real baseline dossier
contract is separate future work.

## Comparable-weekdays correctness signal

The colocated Evolution and KPI hooks explicitly select `passenger-demand/baseline-comparison` in
comparable-weekdays mode and disable the comparison-series request. Because request construction is
now intentionally local to widgets, the former shared request-builder unit test was removed. Keep
the comparable-weekdays live-capture scenario below as the regression check until a widget-hook
test harness or canonical-key approach is justified.

## Live capture procedure

Use an authenticated live session before and after Phase 1:

1. Open browser developer tools and disable the browser HTTP cache.
2. Clear the SWR cache by reloading the application.
3. Select a closed single day, a line with patterns, and `previous-week` comparison.
4. Record overview → demand → planned supply → overview without changing filters.
5. Export the network log and record per resource:
   - request count;
   - transferred bytes;
   - response time;
   - whether navigation caused revalidation.
6. Repeat with `comparable-weekdays` and confirm there is no demand comparison-series request.

Payload and timing values are deliberately captured from a live session rather than committed as
unreliable machine-local numbers. Phase 1 should reduce navigation revalidation and unused fetches
without increasing direct-load requests for any screen.

## Phase 1 structural result

Phase 1 preserves the direct-load inventory above and changes ownership and navigation reuse:

- `LineScopeContextProvider` lives in the shared `[lineId]` layout and fetches only line identity
  and pattern metadata.
- Demand series and comparison widgets currently construct matching URL strings independently, so
  SWR can reuse their responses. A canonical builder is deferred for later evaluation.
- Demand visualizations own colocated data hooks and no page hook forwards their data. Multiple
  widget hooks may subscribe to the same exact SWR key, which shares the response without coupling
  their loading and presentation state.
- Operational series, comparison, heatmap, and pattern breakdowns have independent resource hooks
  and loading/error state.
- Demand and operational pattern reads are requested only by Overview.
- The Demand dossier remains exclusive to Demand; the planned-supply dossier remains the only
  metric request made by Planned Supply.
- Comparable-weekdays operational and demand comparisons use baseline URLs. Demand still has no
  fake comparison-series key.

Operational request construction remains covered by:

```bash
node --import tsx ./src/utils/tests/line-operational-requests.ts
```

The live capture procedure remains necessary to measure server revalidation, transferred bytes,
and ClickHouse query cost; code-level cache identity alone cannot prove those runtime values.
