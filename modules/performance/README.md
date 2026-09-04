# Performance

The Performance module owns metric definitions and the transformations from operational data into additive facts. Public response shapes and cache publication remain owned by Hub.

## Ride metrics for Hub and Videowall

### Decision

Ride-derived metrics use a direct ClickHouse query over the current operational date. The query is exposed through the Performance-owned `queryRidePerformanceDay` interface in `packages/scripts/src/ride-metrics`.

Hub does not query `operation.rides` or its analysis tables directly. It receives neutral hourly facts from Performance and converts them into:

- departure-delay metrics with 60-minute trends;
- service-compliance metrics with 120-minute trends;
- VKM-execution metrics with 120-minute trends.

The data flow is:

```text
operation.rides + operation.ride_analysis_*
                    |
                    v
        Performance ride-metrics query
                    |
                    v
       neutral additive hourly facts
                    |
                    v
          Hub adapters and cache
                    |
                    v
       public endpoints and Videowall
```

The Performance result deliberately contains counts, distance sums and delay sums rather than percentages or averages. Hub can therefore combine any requested set of agencies before calculating ratios.

### Metric definitions

The first definition follows the legacy implementation from the former `TML/api` repository:

- The operational date and cutoffs use `Europe/Lisbon`.
- SLA and scheduled VKM include completed, analyzed rides scheduled at least five minutes before the reference time.
- A ride with no `seen_first_at` is an execution failure.
- After a ride has ended for at least two minutes, combined execution succeeds when either `SIMPLE_ONE_APEX_VALIDATION` or `SIMPLE_THREE_VEHICLE_EVENTS` passes.
- Executed VKM sums `extension_scheduled`; it does not use observed extension.
- Departure delay includes completed rides with an observed start and an expected-start analysis.
- `LATE_START` supplies the legacy delayed-more-than-five-minutes count.
- Negative start deltas are excluded from the average-delay sample.
- Trend membership is based on scheduled start time. Trends did not exist in the legacy API, so this is an explicit new rule.

The legacy SLA code contains an inverted ride-end comparison. Its comment and the legacy VKM calculation both describe the intended rule as `seen_last_at <= reference time - 2 minutes`; this implementation uses that intended rule.

### Why direct query first

The canonical Operation data is already at ride grain and is much smaller than the raw validation stream that justified persisted demand facts. Starting with a direct query provides the shortest path to legacy parity and avoids a second refresh pipeline before production measurements show that one is necessary.

The stable boundary is the Performance interface, not the physical table. Hub and public consumers do not need to change if the backing implementation changes later.

### Concerns and limitations

- The query reads the current day at ride grain and joins three `ReplacingMergeTree` analysis tables using `FINAL`. Running it every 30 seconds may become expensive as the number of operators or rides grows.
- The examiner writes ride and analysis records independently. A query can observe a partially completed generation; analysis-presence checks reduce incorrect classification but do not provide a transactional snapshot.
- A direct query has no durable record of the exact source generation used for a previously published snapshot. The Performance result exposes a source watermark, but the current public schemas retain only the generated time.
- Corrections are visible on the next publication, but there is no explicit reconciliation report or backfill history.
- `observed_start_time_delta` is currently treated as minutes to remain compatible with the analyzer and legacy API. Its type documentation says seconds; that source contract must be normalized separately.
- Public trend intervals are derived from hourly facts. New dimensions that are not selected by the query require changing the Performance contract.
- Source lifecycle and nullable-analysis mismatches must be resolved before the metrics can be considered operationally reliable.

Monitor query duration, returned row count, ClickHouse CPU and source watermark lag at the publication cadence. Those measurements determine whether the direct implementation remains appropriate.

## Alternative: materialized ride-performance fact

If direct queries become expensive, historical auditability is required, or several products consume the metrics, replace the query internals with a Performance-owned fact such as:

```text
performance.ride_service_by_ride
```

The table would contain one normalized row per ride and definition version, including:

- agency, route, operational date and scheduled start;
- scheduled ride and scheduled-distance measures;
- analysis-readiness flags;
- independent APEX and vehicle-event evidence flags;
- observed-start and signed-delay measures;
- source watermark and calculation timestamp.

Recent operational-date partitions would be rebuilt through staging and partition replacement, with refreshes recorded in `performance.metric_refreshes`. Hub would continue to call the same Performance interface and would remain unaware of the storage change.

This alternative improves query cost, reconciliation, backfills and definition versioning. Its costs are duplicated ride-grain storage, a refresh pipeline, possible projection staleness and additional operational ownership. Fixed 60- or 120-minute public buckets should not be the canonical table grain because that would make future interval changes and ride-level reconciliation harder.

## Documentation

### Metric architecture

- [Passenger demand architecture](./docs/passenger-demand-architecture.md)
- [Ride performance architecture](./docs/ride-performance-architecture.md)
- [Performance V2 architecture refactor](./docs/performance-v2-architecture-refactor.md)

### Frontend-new

- [Visualization data map](./docs/frontend-new-data-map.md) — ClickHouse → refresh → API → client per widget
- [Implementation plan](./docs/frontend-new-implementation-plan.md) — line scope context, endpoint consolidation
- [frontend-new README](./apps/frontend-new/README.md) — app entry point
