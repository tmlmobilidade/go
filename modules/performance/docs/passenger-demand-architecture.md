# Passenger Demand Architecture

## Purpose

Passenger demand is organized by subject first, then by write-side facts and
read-side questions. A maintainer should not need to know which worker happens
to run a calculation before finding its implementation.

```text
simplified_apex.validations
        |
        v
passenger-demand/definition.ts
        |
        +--> facts/five-minute --> ClickHouse five-minute fact
        `--> facts/daily       --> ClickHouse daily fact
                                      |
                                      v
                         queries/{fact grain}/{question}.ts
                                      |
                                      v
                         API, publishers, and frontends
```

## Code ownership

```text
modules/performance/packages/scripts/src/
|-- metric-refresh-execution/
|   `-- shared locking, lifecycle tracking, and guarded ClickHouse execution
`-- passenger-demand/
    |-- definition.ts
    |-- facts/
    |   |-- five-minute/
    |   `-- daily/
    `-- queries/
        |-- five-minute/
        `-- daily/
```

- `definition.ts` owns shared business meaning: accepted statuses, timezone,
  unknown-dimension member, and definition version.
- `facts/<grain>` owns how a canonical ClickHouse fact is refreshed and
  reconciled. These modules write data.
- `queries/<grain>` owns named analytical questions over one fact. These
  modules only read data.
- `metric-refresh-execution` is deliberately outside passenger demand because
  its Redis lease, refresh tracking, and ClickHouse guards can be reused by
  supply and service-compliance facts.
- worker apps own cadence only. They call a fact refresh; they do not contain
  the metric definition or SQL.
- API controllers own HTTP concerns and adapt query results. They do not build
  facts.
- `modules/performance/sql` contains manual diagnostics and benchmarks, not
  application query implementations.

## Choosing a fact

The folder name is part of a query's meaning. Two files can answer a similarly
named question while using different grains and therefore returning different
shapes.

| Need | Use | Reason |
| --- | --- | --- |
| Pulse total or ranking for a bounded recent period | Five-minute fact | Supports precise time-of-day cutoffs |
| Intraday curve by five minutes or hour | Five-minute fact | Stores `interval_start` |
| Pattern detail by stop | Five-minute fact | Stores `stop_id` |
| Long historical trend by day, month, or year | Daily fact | Much fewer rows for long ranges |
| Product or passenger-category analysis | Daily fact | Stores `product_id` and `category` |

The five-minute fact stores agency, line, pattern, stop, and interval. It does
not store product or category. The daily fact stores agency, line, pattern,
product, and category. It does not store stop or time of day.

## Why similarly named queries differ

### Five-minute `demand-by-line`

`queries/five-minute/demand-by-line.ts` answers:

> For this bounded operational period and these filters, how much demand did
> each line have?

It returns one additive total per line, usually ordered as a ranking. It is a
good fit for Pulse and for navigating from the network to a line.

Its public function includes the grain:
`queryFiveMinutePassengerDemandByLine`.

### Daily `demand-over-time-by-line`

`queries/daily/demand-over-time-by-line.ts` answers:

> How did each selected line evolve by day, month, or year?

It returns a historical series for each line and currently adapts that series
to the legacy `DemandByLineMetric` document consumed by the existing API and
Hub publisher. Its public function is
`queryDailyPassengerDemandOverTimeByLine`.

These are not duplicate implementations. They have different output shapes
because they answer different questions. If a daily line ranking is needed,
add `queries/daily/demand-by-line.ts`. If an explicit five-minute line series
is needed, extend or wrap `queries/five-minute/demand-over-time.ts` with a line
filter. Do not make one function change meaning based on an implicit table.

The same rule applies to agency and pattern queries:

- use `demand-by-<dimension>` for one grouped result over a period;
- use `demand-over-time-by-<dimension>` for a time series;
- keep the fact grain explicit in the folder and exported function name.

## Write flow

1. A worker decides that a refresh is due.
2. It calls `facts/five-minute` or `facts/daily`.
3. The fact module defines the range and builds a complete replacement.
4. `metric-refresh-execution` acquires the distributed lease and records the
   running/succeeded/failed lifecycle.
5. The fact module validates additive totals before publishing the table or
   partition.

The worker may be realtime or daily without changing the fact's meaning. For
example, the daily fact currently refreshes recent dates frequently to absorb
late arrivals and also receives a full daily rebuild to remove historical
drift.

## Read flow

1. A screen identifies its analytical question and required grain.
2. The API validates authorization and request parameters.
3. It calls one named module under `queries/<grain>`.
4. The query reads a canonical fact without `FINAL`.
5. The API composes the returned rows into the frontend response.

This keeps screen composition out of storage code. A Line Detail response may
combine a five-minute total, an hourly series, a pattern breakdown, and a daily
historical baseline without creating a special `line-detail` fact.

## Performance API

The five-minute read primitives are exposed under `/passenger-demand`:

| Endpoint | Result |
| --- | --- |
| `GET /passenger-demand/total` | One additive total |
| `GET /passenger-demand/over-time` | Five-minute, hourly, or daily points |
| `GET /passenger-demand/by-line` | Ranked line totals |
| `GET /passenger-demand/by-pattern` | Ranked pattern totals |
| `GET /passenger-demand/by-stop` | Ranked stop totals |
| `GET /passenger-demand/comparison` | Current and comparison-period totals and difference |

All endpoints require Performance read permission. The first five require
`start_date` and `end_date`. They accept `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` and
convert them into inclusive operational-date boundaries.

Common optional filters are `agency_id(s)`, `line_id(s)`, `pattern_id(s)`,
`stop_id(s)`, `data_status(es)`, `exclude_unknown`, and the paired
`hour_start`/`hour_end`. ID filters accept repeated or comma-separated query
parameters. Breakdown endpoints also accept `limit`; over-time requires
`time_grain=5_minutes|hour|day`.

Comparison uses four explicit boundaries:
`current_start_date`, `current_end_date`, `comparison_start_date`, and
`comparison_end_date`. This keeps equivalent-day and median-baseline selection
outside the low-level query primitive.

Successful responses use the standard API envelope. An empty breakdown or
series is a successful result with `data: []`; a zero total is not treated as a
missing resource.

## Current migration boundary

The five-minute question modules are ready to become Performance V2 API
primitives. The daily modules preserve the existing metric-document response
contracts while their consumers migrate. Simplifying those contracts should be
a separate change made together with the API and frontend consumers.

The older one-minute agency fact and realtime Videowall projection remain
separate. They should only be retired after their consumers are migrated and
their exact closed-minute semantics are no longer required.

## Adding a new metric

Before adding a table, check whether the metric is an aggregation of an
existing additive fact:

1. write the question and expected result shape;
2. list its required dimensions and lowest time grain;
3. select the smallest existing fact that contains those dimensions;
4. add a named read module under that fact grain;
5. create a new fact only when the required grain or dimensions do not exist;
6. expose it through the API only after query correctness and cost are tested.
