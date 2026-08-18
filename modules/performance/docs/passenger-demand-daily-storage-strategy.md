# Daily Passenger Demand Storage Strategy

The five-minute dimensional fact introduced for Performance V2 is documented
separately in [passenger-demand-five-minute-storage-strategy.md](./passenger-demand-five-minute-storage-strategy.md).

The shared code organization and query-selection rules are documented in
[Passenger Demand Architecture](./passenger-demand-architecture.md).

## Decision

Introduce `performance.passenger_demand_by_dimensions_by_day` as the canonical
additive fact for historical passenger-demand metrics. Use it to replace the
large family of separately materialized day, month, and year demand metrics
after their outputs have been reconciled.

The table is rebuilt using two complementary paths:

- once a day, rebuild all history in a separate table and publish it with an
  atomic `EXCHANGE TABLES` operation;
- every five minutes, recompute the latest seven operational dates and publish
  each affected monthly partition with `REPLACE PARTITION`.

The five-minute path keeps recent late arrivals and source corrections visible.
The daily path removes accumulated drift from all history and gives us a simple
recovery mechanism.

## Why one daily-dimensional fact

Most existing demand metrics differ only in how they group accepted
validations. They repeatedly scan the same source and persist variations such
as demand by agency, line, pattern, product, category, day, month, or year.

The proposed fact stores the lowest shared historical grain:

```text
definition_version
+ operational_date
+ agency_id
+ line_id
+ pattern_id
+ product_id
+ category
```

Every stored measure is additive. Consumers can derive coarser views with
`sum(accepted_validations_qty)` without maintaining another source-specific
calculation. Missing nullable source dimensions are represented by the
`__unknown__` member so totals remain stable across every grouping.

Definition `passenger-demand-v2` counts validation statuses `0`, `4`, `5`, and
`6`, matching the current public metric definition.

## Relationship to the recent tables

### `passenger_demand_by_agency_by_1_minute`

This is the reconciled event-time fact used for intraday trends and exact
closed-minute comparisons. Its grain includes `interval_start`, but only the
agency dimension.

### `passenger_demand_realtime`

This is a small current read model derived from the minute fact. It stores the
current and previous-week cumulative values at equivalent cutoffs for each
agency.

### `passenger_demand_by_dimensions_by_day`

This is the proposed historical fact. It retains the dimensions needed by the
existing analytical metrics, but it deliberately has no time-of-day bucket.

The daily-dimensional fact can replace the existing day/month/year aggregate
metrics. It cannot, by itself, replace the minute fact or realtime projection
without losing intraday trends and exact same-time comparisons. Keep those two
tables during the first migration. Retire them only if their consumers stop
requiring intraday data, or after adding an appropriate intraday grain to the
new model.

## Schema ownership

Canonical ClickHouse tables are owned by
`@tmlmobilidade/go-interfaces-labdb`, not by handwritten bootstrap DDL. The
interface schema creates these tables when LabDB initializes:

- `performance.passenger_demand_by_agency_by_1_minute`;
- `performance.passenger_demand_realtime`;
- `performance.passenger_demand_by_dimensions_by_day`;
- `performance.metric_refreshes`.

The SQL directory contains operational transformations, staging-table setup,
reconciliation queries, and benchmarks. Staging tables remain SQL-owned because
they are implementation details and must not be exposed as application
interfaces.

The daily-dimensional table uses `MergeTree`, rather than
`ReplacingMergeTree`. Refreshes replace a complete table or partition, so there
should be only one physical row for each fact key. This also removes the need
for consumers to use `FINAL`.

LabDB currently creates missing tables but does not migrate an existing table's
engine or keys. If a prototype version of the daily-dimensional table was
created manually, compare `SHOW CREATE TABLE` with the interface definition and
recreate it before the first managed rebuild.

## Daily atomic rebuild

`rebuild-passenger-demand-by-dimensions-by-day.sql` performs the full rebuild:

1. create the full-rebuild staging table if it does not exist;
2. truncate the previous staging contents;
3. aggregate all accepted validations from `simplified_apex.validations FINAL`;
4. pin population and validation to one `updated_at` source cutoff, then refuse
   promotion if the accepted source count is zero or differs from the
   sum of staged facts;
5. atomically exchange the canonical and staging table names.

The previous canonical table remains under the staging name after the exchange.
It is available for inspection or rollback until the next daily run truncates
it.

`EXCHANGE TABLES` requires the `performance` database to use ClickHouse's
`Atomic` database engine. The automated workflow and manual runbook check the
actual engine and fail with a specific error before touching staging data when
that prerequisite is not met. The LabDB interface currently relies on the
server's default engine when creating databases; it does not force `Atomic`.

## Five-minute rolling-week refresh

Every five minutes, calculate an inclusive range covering the newest seven
operational dates. For each `YYYYMM` partition touched by that range, execute
`refresh-recent-passenger-demand-by-dimensions-by-day.sql` with:

- `partition_month`: the affected `YYYYMM` value;
- `start_date`: the oldest date in the rolling window;
- `end_date`: the newest date in the rolling window;
- `source_cutoff`: one timestamp captured before any affected partition is
  rebuilt, preventing new arrivals from changing validation totals mid-run.

The SQL builds the replacement partition from:

- existing canonical rows in that month that fall outside the rolling window;
- freshly aggregated source rows inside the rolling window.

It verifies the recent source total and then uses `REPLACE PARTITION`. This
removes stale dimension keys when source corrections make a previously stored
group disappear; appending replacement rows would not reliably do that.

A seven-date range normally touches one monthly partition and occasionally two.
Each partition replacement is atomic. When two months are involved, the two
replacements are sequential rather than one cross-partition transaction. The
daily full rebuild remains the atomic whole-table checkpoint.

## Concurrency and observability

The workflows are automated by the Performance metric workers:

- `sync-metrics-realtime` attempts the rolling seven-date refresh once per
  five-minute slot. If another refresh owns the lock, it retries on its next
  30-second worker cycle;
- `sync-metrics-daily` runs the full rebuild after the legacy daily metric
  syncs and waits up to ten minutes for an in-progress rolling refresh.

Both paths call `@tmlmobilidade/go-performance-pckg-scripts`, which contains
the packaged equivalents of the SQL runbooks. They share a token-owned Redis
lease under `performance:passenger-demand-by-dimensions-by-day:refresh-lock`.
The lease is renewed while work is running and can only be released by its
owner. This prevents a recent refresh from copying canonical rows while the
daily workflow exchanges table names. Both worker deployments therefore need
the `CACHEDB_HOST` and `CACHEDB_PORT` connection settings as well as LabDB.

The SQL files remain the operator-facing manual/recovery form of the same
workflow. Changes to a transformation must be applied to both the packaged
queries and its corresponding runbook.

Both workflows record their lifecycle in `performance.metric_refreshes` using
metric name
`passenger_demand_by_dimensions_by_day`:

- daily full rebuild: `reconciliation`, covering the complete source range;
- five-minute rolling week: `reconciliation`, covering its seven dates;
- one-off historical initialization: `backfill`.

The `running` state is written after acquiring the lock. The terminal
`succeeded` or `failed` state is written before releasing it, with source and
result quantities, source watermark, timestamps, and any error. Runs skipped
because another worker owns the lock do not create refresh records. Alerting on
failed refreshes, mismatched totals, and a successful refresh age above the
expected cadence remains deployment work.

## Reconciliation

Two checks are required before promoting the new table to canonical metric
source:

1. `reconcile-passenger-demand-by-dimensions-by-day.sql` must return no
   dimension-level differences against accepted source validations.
2. `benchmark-existing-demand-metrics.sql` must reproduce each existing
   metric's intended result and establish acceptable query cost.

Source-to-fact equality is the primary invariant:

```text
accepted source validations
= sum(passenger_demand_by_dimensions_by_day.accepted_validations_qty)
```

Run reconciliation for the rolling week after five-minute refreshes and for the
complete available range after each daily rebuild.

## Migration sequence

1. Create the interface-managed daily-dimensional table.
2. Run and reconcile a full historical rebuild.
3. Automate the five-minute rolling-week refresh and daily full rebuild.
   (Implemented.)
4. Record refresh history. (Implemented.)
5. Run the existing and proposed metrics in parallel.
6. Compare totals and grouped outputs for a representative historical period.
7. Move historical metric consumers to queries over the new fact.
8. Remove superseded aggregate tables and jobs only after an agreed parity
   period.
9. Reassess the minute fact and realtime projection separately; do not remove
   them as part of the historical-metric migration.
