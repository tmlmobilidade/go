# Five-Minute Passenger Demand Storage Strategy

## Canonical fact

`performance.passenger_demand_by_dimensions_by_5_minutes` stores accepted
validations at the operational grain required by Performance V2:

```text
definition_version
+ operational_date
+ interval_start
+ agency_id
+ line_id
+ pattern_id
+ stop_id
```

The additive measure is `accepted_validations_qty`. Accepted validations use
definition `passenger-demand-v2`, corresponding to statuses `0`, `4`, `5`, and
`6` from `simplified_apex.validations`.

`interval_start` is the real validation timestamp rounded down to a five-minute
Unix-millisecond boundary. Line, pattern, and stop are sourced directly from the
validation. The fact does not depend on a ride match. Product and category stay
in `passenger_demand_by_dimensions_by_day`.

Missing dimensions use `__unknown__`; source rows are never discarded because
one of these dimensions is absent.

## Physical model

The canonical table uses one ClickHouse partition per `operational_date`. This
allows one date to be rebuilt and atomically published without copying the
other high-cardinality dates in the same month.

Publication is:

```text
simplified_apex.validations FINAL
  -> passenger_demand_by_dimensions_by_5_minutes_refresh
  -> source/staging total assertion
  -> REPLACE PARTITION operational_date
```

An empty source date is a successful no-op. It does not delete a previously
published partition; the zero source count remains visible in
`performance.metric_refreshes` for data-quality monitoring.

Frontend queries must read the canonical table without `FINAL`.

## Publication states

- current operational date: `provisional`;
- closed dates rebuilt by reconciliation or backfill: `reconciled`.

Reconciled does not mean immutable. A later complete partition rebuild may
correct late or changed source data.

## Refresh modes

The realtime worker refreshes the current operational date once per newly
closed five-minute bucket. Its source cutoff is the final millisecond of that
closed bucket, so an incomplete bucket is never published.

The daily worker reconciles the previous 14 closed operational dates, one date
at a time.

Historical ranges use the explicit backfill entry point and are also processed
one date at a time. This avoids aggregating the complete validations history in
one query. Backfills accept only closed operational dates; the current date is
owned by the incremental refresh.

Run a backfill with:

```bash
PASSENGER_DEMAND_FIVE_MINUTE_BACKFILL_START=20260801 \
PASSENGER_DEMAND_FIVE_MINUTE_BACKFILL_END=20260807 \
npm run backfill:passenger-demand-five-minute \
  --workspace=@tmlmobilidade/go-performance-sync-metrics-realtime
```

All modes use a distributed Redis lock and record running, succeeded, or failed
states in `performance.metric_refreshes` under:

```text
passenger_demand_by_dimensions_by_5_minutes
```

## Required validation before production backfill

For a small, known date range:

1. initialize the new LabDB Performance interface;
2. run a one-day backfill;
3. confirm source accepted validations equal the fact sum;
4. confirm the logical key is unique;
5. rerun the same date and confirm stable totals;
6. inspect row count, compressed bytes, parts, peak memory, and execution time;
7. test aggregation by network, line, pattern, stop, and hour.

The builder is safe to rerun, but a production-scale historical backfill should
only start after these checks pass in staging.

## Read-query modules

`packages/scripts/src/passenger-demand/queries/five-minute` exposes one
module per frontend question:

- `queryFiveMinutePassengerDemandTotal` for one additive total;
- `queryFiveMinutePassengerDemandOverTime` for five-minute, hourly, or operational-day
  series;
- `queryFiveMinutePassengerDemandByLine` for network-to-line breakdowns;
- `queryFiveMinutePassengerDemandByPattern` for line-to-pattern breakdowns;
- `queryFiveMinutePassengerDemandByStop` for pattern-to-stop breakdowns;
- `queryFiveMinutePassengerDemandComparison` for one explicit current period against one
  explicit comparison period.

Line, pattern, and stop reads return explicit identifiers instead of a generic
`dimension_id`. Shared ClickHouse filter construction remains internal in
`queries/query-support.ts`.

Every query requires a bounded period, reads the canonical fact without
`FINAL`, and supports optional agency, line, pattern, stop, data-status, and
local-hour filters. Local-hour ranges may cross midnight, for example
22:00–03:00. Breakdown queries default to the top 100 results and accept a
validated limit up to 1,000.

Comparison returns the two additive totals, absolute difference, and percentage
difference. Percentage difference is `null` when the comparison total is zero.
Equivalent-day selection and median baselines remain a later policy layer; they
will call these explicit-period primitives rather than changing the fact.

See [Passenger Demand Architecture](./passenger-demand-architecture.md) for
the complete producer-to-consumer flow and the distinction between five-minute
and daily queries.
