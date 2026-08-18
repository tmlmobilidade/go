# Performance V2 Architecture Refactor Plan

## Purpose

This plan reorganizes the Performance module so that a maintainer can follow a
metric from its source data to its ClickHouse facts, read queries, HTTP
controllers, and frontend screens without first understanding worker cadence or
legacy materializations.

The first application is passenger demand, but the same organization should
later support supply, service compliance, punctuality, feedback, and other
Performance subjects.

This is an architecture refactor. The initial steps must preserve existing
metric definitions, stored data, refresh behaviour, and query results.

The passenger-demand package reorganization described here has now been
implemented. [Passenger Demand Architecture](./passenger-demand-architecture.md)
documents the resulting structure and is the canonical guide for new work.

## Current friction

Before this refactor, passenger-demand knowledge was distributed across:

- `apps/sync-metrics-realtime`;
- `apps/sync-metrics-hourly`;
- `apps/sync-metrics-daily`;
- `packages/scripts/passenger-demand-history`;
- `packages/scripts/passenger-demand-intraday`;
- `packages/scripts/passenger-demand-metrics`;
- `sql/demand`;
- LabDB schemas and interfaces;
- Performance types;
- HTTP metric controllers.

The structure mixes several independent concepts:

1. the metric subject, such as passenger demand;
2. the physical grain of a fact, such as one minute, five minutes, or one day;
3. the execution cadence, such as realtime, hourly, or daily;
4. the operation being performed, such as refresh, reconciliation, query, or
   benchmark;
5. the consumer, such as Performance V2 or the Videowall.

This reduces locality. Understanding one passenger-demand flow requires moving
between several shallow modules and learning implementation details that are
not relevant to the caller.

## Architectural principles

### Organize by metric subject first

Passenger demand should be the primary unit of organization. Fact refreshes,
read queries, metric definitions, and tests should be discoverable under one
passenger-demand module.

Runtime cadence is an adapter concern. A realtime or daily worker decides when
to call the passenger-demand module; it does not own the metric calculation.

### Name facts by physical grain

Do not use `intraday` and `history` as canonical storage concepts:

- an intraday fact can retain several years of history;
- a historical query can read either a five-minute fact or a daily fact;
- the terms do not reveal the stored grain.

Use these concepts instead:

| Concept | Meaning |
| --- | --- |
| Passenger-demand definition | Accepted statuses, timezone, unknown-dimension policy, and definition version |
| Five-minute fact | Demand by operational date, five-minute interval, agency, line, pattern, and stop |
| Daily fact | Demand by operational date, agency, line, pattern, product, and category |
| Current projection | A precomputed current headline for consumers that need a very small live read |
| Historical demand | A query over a date range, not a separate storage concept |

The existing one-minute Videowall fact remains a separate fact until its future
is explicitly decided. This refactor must not silently replace it with the new
five-minute fact.

### Expose question-shaped read modules

Callers should request an answer such as demand by line or demand by stop. They
should not have to understand a generic SQL dimension interface.

Generic filter and SQL-building behaviour can remain inside the implementation,
but it should not be the public interface.

### Keep one source of truth per concern

| Concern | Canonical location |
| --- | --- |
| Passenger-demand definition | Performance passenger-demand module |
| Shared TypeScript contracts | `packages-new/types/performance` |
| ClickHouse table schema | `packages-new/interfaces/labdb` |
| Table registration and creation | LabDB Performance interface |
| Fact construction and publication | Performance passenger-demand module |
| Refresh cadence | Performance worker apps |
| Fact read queries | Performance passenger-demand module |
| HTTP parsing and authorization | Performance HTTP app |
| Screen composition | Performance frontend app |
| Manual diagnostics and benchmarks | `modules/performance/sql` |
| Metric and storage explanation | `modules/performance/docs` |

The SQL directory must not become a second source of truth for runtime table
schemas or application queries.

## Target data flow

```text
simplified_apex.validations
        |
        v
passenger-demand definition
        |
        +--> five-minute fact refresh
        |       `--> ClickHouse five-minute fact
        |
        +--> daily fact refresh
        |       `--> ClickHouse daily fact
        |
        `--> current projection refresh
                `--> ClickHouse current projection

ClickHouse canonical facts
        |
        v
question-shaped read modules
        |
        v
HTTP controller adapters
        |
        v
Performance frontend
        |
        +--> Pulse
        +--> Line Detail
        `--> Pattern Detail
```

## Target repository structure

The following is the intended direction, not a requirement to move everything
in one change.

```text
modules/performance/
|-- apps/
|   |-- api/
|   |   `-- src/endpoints/passenger-demand/
|   |       |-- passenger-demand.routes.ts
|   |       |-- query-params.ts
|   |       `-- controllers/
|   |           |-- get-demand-total.ts
|   |           |-- get-demand-over-time.ts
|   |           |-- get-demand-by-line.ts
|   |           |-- get-demand-by-pattern.ts
|   |           |-- get-demand-by-stop.ts
|   |           `-- compare-demand.ts
|   |
|   |-- sync-metrics-realtime/
|   |   `-- src/tasks/
|   |       `-- refresh-passenger-demand-five-minute.ts
|   |
|   |-- sync-metrics-daily/
|   |   `-- src/tasks/
|   |       |-- reconcile-passenger-demand-five-minute.ts
|   |       `-- refresh-passenger-demand-daily.ts
|   |
|   `-- sync-metrics-hourly/
|       `-- legacy metric tasks only
|
|-- packages/
|   `-- scripts/
|       `-- src/passenger-demand/
|           |-- definition.ts
|           |-- index.ts
|           |
|           |-- facts/
|           |   |-- five-minute/
|           |   |   |-- refresh.ts
|           |   |   `-- tests/
|           |   |-- daily/
|           |   |   |-- refresh.ts
|           |   |   `-- tests/
|           |   `-- current-projection/
|           |       |-- refresh.ts
|           |       `-- tests/
|           |
|           `-- queries/
|               |-- five-minute/
|               |   |-- demand-total.ts
|               |   |-- demand-over-time.ts
|               |   |-- demand-by-line.ts
|               |   |-- demand-by-pattern.ts
|               |   |-- demand-by-stop.ts
|               |   |-- demand-comparison.ts
|               |   `-- query-support.ts
|               `-- daily/
|                   |-- demand-over-time-by-agency.ts
|                   |-- demand-over-time-by-line.ts
|                   `-- demand-over-time-by-pattern.ts
|
|-- docs/
|   `-- passenger-demand/
|       |-- definition.md
|       |-- five-minute-fact.md
|       |-- daily-fact.md
|       `-- frontend-queries.md
|
`-- sql/
    `-- passenger-demand/
        |-- benchmarks/
        |-- diagnostics/
        `-- manual-maintenance/
```

The existing `packages/scripts` workspace name is retained to avoid turning a
domain refactor into a package-wide migration. Its internal structure is now
metric-oriented. The shared `metric-refresh-execution` module remains beside
`passenger-demand` because other metric subjects can reuse it.

## Passenger-demand read modules

### `demand-total.ts`

Returns the additive passenger-demand total for one filtered period.

Filters may include agency, line, pattern, stop, data status, and local-hour
range.

### `demand-over-time.ts`

Returns demand as a time series. Five-minute, hour, and operational-day grains
belong in the same module because they answer the same question: how demand
changed over time.

### `demand-by-line.ts`

Returns explicit rows containing `line_id` and `passenger_demand`.

### `demand-by-pattern.ts`

Returns explicit rows containing `pattern_id` and `passenger_demand`.

A Line Detail caller supplies the selected line as a filter. Do not create a
separate `demand-by-pattern-by-line` module.

### `demand-by-stop.ts`

Returns explicit rows containing `stop_id` and `passenger_demand`.

A Pattern Detail caller supplies the selected pattern as a filter. Do not create
a separate `demand-by-stop-by-pattern` module.

### `demand-comparison.ts`

Returns current quantity, comparison quantity, absolute difference, and
percentage difference for two explicit periods.

Comparable-date selection and median-baseline policy should be built above this
explicit comparison primitive.

### `query-support.ts`

This is an internal implementation module for:

- common ClickHouse parameters;
- date and dimension filters;
- local-hour filtering;
- unknown-dimension filtering;
- row normalization.

It should not export a generic dimension query to HTTP controllers or frontend
callers.

## Screen-to-query mapping

### Pulse

- demand total;
- demand over time;
- demand by line;
- demand comparison.

### Line Detail

Every read is filtered by the selected line:

- demand total;
- demand over time;
- demand by pattern;
- demand comparison.

### Pattern Detail

Every read is filtered by the selected pattern:

- demand total;
- demand over time;
- demand by stop;
- demand comparison.

The same question-shaped read modules therefore support all three screens
without creating a file for every screen and filter combination.

## Fact refresh modules

The current refresh folders contain several small files such as:

```text
constants.ts
distributed-lock.ts
queries.ts
refresh-plan.ts
refresh-tracker.ts
refresh.ts
types.ts
index.ts
```

This makes the interface nearly as large as the implementation. A maintainer
must move through most of the files to understand one refresh.

### Fact-specific implementation

A fact folder should initially expose one deep refresh interface:

```text
five-minute/
|-- refresh.ts
`-- tests/
```

Private source SQL, staging SQL, publication rules, fact-specific types, and
fact-specific constants may remain together in `refresh.ts`. A cohesive file is
preferable to several shallow files created only by implementation category.

Extract another module only when it hides meaningful behaviour behind a smaller
interface or is independently reused.

### Shared refresh execution

Distributed locking and refresh lifecycle tracking should be one deep module:

```text
refresh-execution/
`-- run-metric-refresh.ts
```

Its implementation owns:

- acquiring and releasing the distributed lock;
- writing the running refresh state;
- writing the succeeded state;
- writing the failed state;
- preserving the original error;
- recording source rows, result rows, and watermark.

Fact refreshes should provide metadata and the fact-specific operation without
reimplementing this lifecycle.

### Refresh planning and cadence

If a refresh plan describes when work is due, it belongs in the worker adapter.
If it describes a fact invariant, it belongs in the fact implementation.

This distinction prevents process cadence from leaking into the
passenger-demand calculation.

## Worker responsibilities

The three worker apps do not need to be merged as part of this refactor. They
may require different deployment, scaling, retry, or monitoring policies.

Their intended behaviour is narrow:

```text
wake up
  -> determine whether work is due
  -> invoke a metric refresh interface
  -> report the result
```

Workers should not own:

- accepted-validation definitions;
- source or fact SQL;
- fact row construction;
- staging and partition-publication rules;
- analytical read queries.

New Performance V2 metrics should not be added to the legacy hourly
materialization structure.

Intended direction:

- realtime worker: current operational-date and current-projection refreshes;
- daily worker: closed-date reconciliation and daily fact refreshes;
- hourly worker: legacy metrics only, followed by removal when their consumers
  have migrated.

## SQL directory policy

Keep `modules/performance/sql`, but restrict it to human-operated SQL:

- benchmarks;
- diagnostics;
- data-quality investigation;
- manual reconciliation;
- recovery and maintenance procedures.

Runtime SQL belongs beside the metric implementation so it can be parameterized,
versioned with the behaviour, and tested through the same interface used by
callers.

Each manually executed SQL file should declare:

```sql
-- Purpose: benchmark | diagnostic | manual-maintenance
-- Canonical table: performance.<table_name>
-- Safety: read-only | mutating
-- Used by runtime: no
```

## Legacy isolation

The module currently contains several generations of passenger-demand metrics:

- the one-minute fact and current projection used by the Videowall;
- the new five-minute dimensional fact for Performance V2;
- the daily dimensional fact;
- older day, month, and year materializations in hourly and daily workers.

They must be inventoried before files are moved. Every legacy metric should
record:

- canonical table;
- current producer;
- current consumers;
- replacement query or table;
- migration status;
- deletion condition.

Legacy code may be placed under a clearly named `legacy` folder during the
migration, but moving it is not a substitute for recording and completing its
removal.

## Refactor phases

### Phase 1 — Terminology and read-query locality

1. Adopt `five-minute fact`, `daily fact`, and `current projection` in docs.
2. Split `passenger-demand-intraday/read-queries.ts` into question-shaped files.
3. Keep shared filter construction internal in `query-support.ts`.
4. Replace generic `dimension_id` outputs with explicit `line_id`, `pattern_id`,
   and `stop_id` outputs.
5. Preserve the generated SQL and returned numeric values.

Acceptance criteria:

- each public read answers one named frontend question;
- existing filters continue to work;
- the sum and ranking results match the current implementation;
- existing Phase 2 query tests remain equivalent or become more explicit;
- no worker or ClickHouse schema change is required.

### Phase 2 — Refresh execution depth

1. Introduce the shared `run-metric-refresh` module.
2. Move lock and tracking behaviour behind its interface.
3. Consolidate fact-specific refresh implementation.
4. Move cadence-only planning to worker tasks.
5. Test success, failure, lock contention, and empty-source behaviour through
   the refresh interface.

Acceptance criteria:

- fact refreshes do not manage refresh tracking directly;
- lock release is guaranteed on every terminal path;
- refresh result metadata remains unchanged;
- backfill and reconciliation remain idempotent;
- staging publication invariants remain unchanged.

### Phase 3 — Metric package and naming

1. Rename `packages/scripts` to a metric-oriented package such as
   `packages/metrics`.
2. Group passenger-demand facts and queries under one module.
3. Rename `passenger-demand-intraday` to `five-minute`.
4. Rename `passenger-demand-history` to `daily`.
5. Update imports without changing runtime behaviour.

Acceptance criteria:

- a maintainer can find all passenger-demand implementations from one folder;
- worker apps contain only scheduling adapters and executable entry points;
- package exports expose intentional metric interfaces rather than internal
  implementation files.

### Phase 4 — HTTP controllers

1. Add passenger-demand-specific routes and controllers.
2. Parse and validate request filters at the HTTP seam.
3. Call only question-shaped metric read interfaces.
4. Keep controllers free of ClickHouse SQL and aggregation policy.
5. Add request-validation and response-contract tests.

Acceptance criteria:

- Pulse, Line Detail, and Pattern Detail can request all Phase 2 demand reads;
- invalid date, hour, dimension, and limit inputs fail consistently;
- controllers do not import LabDB directly;
- response fields use domain names rather than generic dimension fields.

### Phase 5 — Legacy migration

1. Complete the legacy metric inventory.
2. Map every frontend and external consumer to its replacement.
3. Stop creating new legacy day, month, and year materializations.
4. Migrate consumers incrementally.
5. Remove producers and tables only after their deletion conditions are met.

Acceptance criteria:

- every remaining metric table has an active documented consumer;
- duplicate materializations have an explicit removal decision;
- hourly worker responsibilities shrink instead of expanding;
- table deletion is handled separately and deliberately.

## Recommended first implementation

Begin with Phase 1 before adding the new HTTP endpoints.

The first implementation should be a behaviour-preserving split of
`passenger-demand-intraday/read-queries.ts` into:

```text
queries/
|-- demand-total.ts
|-- demand-over-time.ts
|-- demand-by-line.ts
|-- demand-by-pattern.ts
|-- demand-by-stop.ts
|-- demand-comparison.ts
|-- query-support.ts
|-- index.ts
`-- tests/
```

This gives the next phase explicit interfaces for Pulse, Line Detail, and
Pattern Detail without requiring a simultaneous worker, schema, or data
migration.

## Implementation status

Completed in the first architecture refactor:

- renamed the new V2 `intraday` concept to `five-minute` in code and worker
  adapters;
- split the former `read-queries.ts` into total, over-time, line, pattern, stop,
  and comparison modules;
- replaced generic breakdown output identifiers with explicit line, pattern,
  and stop identifiers;
- concentrated common query filtering in internal `query-support.ts`;
- concentrated distributed locking, refresh lifecycle tracking, and locked
  ClickHouse execution in `metric-refresh-execution`;
- migrated both five-minute and daily fact refreshes to that execution module;
- grouped the five-minute and daily fact producers under
  `passenger-demand/facts`;
- grouped five-minute and daily readers under `passenger-demand/queries`;
- renamed daily public reads to state that they return historical time series,
  for example `queryDailyPassengerDemandOverTimeByLine`;
- renamed five-minute public reads to include their fact grain, for example
  `queryFiveMinutePassengerDemandByLine`;
- updated Performance API, Hub publisher, realtime worker, daily worker, tests,
  and package barrels to use the unified module;
- added authorized `/passenger-demand` API endpoints for total, over-time,
  line, pattern, stop, and explicit-period comparison reads;
- added one validated HTTP query seam for shared filters and generated the
  corresponding `API_ROUTES.performance` entries;
- retained the existing package name and legacy workflows because Hub and
  existing Performance consumers still import them;
- removed `intraday` and `history` aliases from the new implementation so the
  fact grain is explicit at every public seam.

Still deferred:

- renaming the shared `packages/scripts` workspace;
- inventorying and removing legacy materializations;
- deciding the long-term relationship between the one-minute Videowall fact
  and the five-minute Performance V2 fact.

## Decisions to confirm during implementation

- Whether the shared package should be named `metrics`, `metric-engine`, or
  another domain-oriented name.
- Whether the existing one-minute Videowall fact will remain permanently or
  later be derived from another canonical fact.
- Whether `demand-total` should remain a dedicated optimized query or be derived
  from a comparison/series primitive.
- Whether agency ranking is required as an explicit `demand-by-agency` read for
  Pulse or only as a global filter.
- Which legacy materializations still have active external consumers.
- Whether the worker apps need separate deployment characteristics after the
  legacy hourly metrics are removed.

These decisions do not block the first behaviour-preserving read-query split.
