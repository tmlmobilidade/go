# Ride Performance Architecture

## Purpose

Ride performance is organized by subject, then by its canonical ride-grain
fact and question-shaped reads. The existing current-day direct query remains
the low-latency source for Hub while Performance V2 adopts the reconciled fact.

```text
operation.rides + operation.ride_analysis_*
                    |
                    v
          ride-performance/definition.ts
                    |
                    v
             facts/by-ride
                    |
                    v
       performance.ride_service_by_ride
                    |
                    v
             queries/by-ride
                    |
                    v
        Performance API and frontend
```

## Definition

Definition `ride-performance-v1` uses the `Europe/Lisbon` operational date and
stores one normalized row per ride:

- service eligibility follows the existing five-minute scheduling grace,
  completed-processing, and analysis-readiness rules;
- an eligible ride fails service when it has no execution evidence or, after
  its end grace, both APEX and vehicle-event analyses fail;
- delay coverage is observed starts divided by rides scheduled before the
  eligibility cutoff;
- delays are `LATE_START` rides divided by observed starts;
- advances are `EARLY_START` rides divided by observed starts.

Percentages are derived from additive numerators and denominators. A zero
denominator produces `null`, not zero.

## Canonical fact

`performance.ride_service_by_ride` is partitioned by operational date and
contains agency, line, pattern, scheduled hour, source readiness, execution,
punctuality, and distance measures. Missing line and pattern identifiers use
`__unknown__`.

Refreshes build a complete operational-date partition in staging, assert one
row per source ride and a unique logical key, then publish with
`REPLACE PARTITION`. Current-day data is provisional and refreshed on closed
five-minute boundaries. The daily worker reconciles the previous 14 closed
dates. Historical backfills process one closed date at a time.

All refresh modes use `metric-refresh-execution` for a token-owned Redis lock
and lifecycle records in `performance.metric_refreshes`.

## Read questions

The fact supports:

- totals and daily or hourly series for one filtered period;
- network-to-line breakdowns;
- line-to-pattern breakdowns;
- explicit current/comparison period results;
- weekday-by-hour heatmaps.

Reads return their additive quantities together with nullable percentages so
coverage and aggregation remain auditable.

## Frontend mapping

| Screen | Demand reads | Ride-performance reads |
| --- | --- | --- |
| Network lines | by-line for current and comparison periods | by-line comparison |
| Line detail cards | over-time and comparison | over-time and comparison |
| Pattern table | by-pattern filtered by line | by-pattern filtered by line |
| Reliability heatmap | hourly over-time grouped by weekday/hour | weekday-by-hour |

The frontend derives attention state from service and delay thresholds. Alerts
are not a ride-performance metric and are not displayed until a real Alerts
integration is defined.

## Migration boundary

Hub's `queryRidePerformanceDay` path continues to query the current operational
date directly at 30-second cadence. It may move to the canonical fact only
after freshness and parity are proven separately. Performance V2 must not
change the public realtime contract during this migration.
