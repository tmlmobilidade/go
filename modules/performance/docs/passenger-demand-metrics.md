# Passenger Demand Metrics

## Ownership and purpose

Performance owns the canonical passenger-demand calculation and its
event-time history. Hub publishes a compact public projection; the Videowall
does not calculate demand from raw validations.

```text
simplified_apex.validations
  -> Performance one-minute facts
  -> Performance current projection
  -> Hub publisher and cache
  -> Hub API
  -> Videowall
```

This metric counts accepted passenger validations. It is not vehicle
occupancy and it is not a distinct-passenger count. Definition
`passenger-demand-v2` accepts validation statuses `0`, `4`, `5`, and `6`.

The operational timezone is `Europe/Lisbon`; an operational date starts at
04:00 and ends immediately before 04:00 on the following civil date.

## Stored objects

### One-minute fact

`performance.passenger_demand_by_agency_by_1_minute` stores one row per:

```text
definition_version
+ operational_date
+ agency_id
+ interval_start
```

`accepted_validations_qty` is the number of accepted validations whose
`created_at` falls in that minute. `interval_start` is the minute boundary in
Unix milliseconds. `source_watermark` records the latest source update included
in the row, and `calculated_at` versions replacement rows.

The table uses `ReplacingMergeTree(calculated_at)`. Consumers read it with
`FINAL` because reconciliation may replace an earlier value for the same
minute.

### Current projection

`performance.passenger_demand_realtime` stores the latest cumulative current
and previous-week values by agency:

```text
definition_version
+ current_operational_date
+ agency_id
```

The projection contains:

- `passenger_validations_qty_now`;
- `passenger_validations_qty_last_week`;
- their exact `current_cutoff` and `last_week_cutoff`;
- calculation time and source watermark.

It is derived only after the corresponding minute facts have been refreshed.
It is a current read model, not the source of trend history.

### Refresh history

`performance.metric_refreshes` records each bounded backfill, incremental
refresh, and reconciliation. Running and terminal states share a `refresh_id`
and are replaced by `updated_at`.

## Closed-minute policy

The worker wakes every 30 seconds but advances demand only once for each newly
closed minute:

```text
current_cutoff = floor(reference_now / 60 seconds) * 60 seconds - 1 ms
```

For example, at `16:03:27`, the cutoff is `16:02:59.999`. The current value
includes complete minutes from 04:00 through 16:02. The still-open 16:03 minute
is included after it closes and the next worker cycle completes.

This gives the Videowall a value that updates by the minute while keeping every
comparison exact. A partial current minute is never compared with a complete
historical minute.

For each new cutoff, the worker:

1. reads deduplicated validations for the current operational date through the
   cutoff;
2. groups them by agency and event-time minute;
3. writes replacement fact rows, including zero replacements for previously
   present keys that disappeared after source correction;
4. sums those facts through the cutoff for the current date;
5. sums the date seven calendar days earlier through the equivalent Lisbon
   wall-clock cutoff;
6. replaces the current projection;
7. marks the tracked refresh as succeeded only after both writes complete.

The current operational date is recalculated as a bounded range on every new
minute. Late validations for an earlier minute today are therefore reflected
on the following refresh.

## History and reconciliation

When the fact table is empty, the worker bootstraps the previous 56 days before
publishing the first current projection. This covers the eight preceding
occurrences of the same weekday.

The initial reconciliation policy is:

- current operational date: every newly closed minute;
- previous two operational dates: once per process hour;
- previous fourteen operational dates: once per process day;
- arbitrary history: explicit bounded backfill using
  `PASSENGER_DEMAND_BACKFILL_START` and
  `PASSENGER_DEMAND_BACKFILL_END`.

All paths execute the same fact definition. Reconciliation replaces a minute;
it does not append a compensating delta.

Comparable dates are not stored in a table and are not read from Offer. Hub
calculates the previous 7, 14, …, 56 calendar days directly, which preserves
the weekday. Holidays and Offer year periods do not change the selection.

## Required invariants

- The sum of current-date one-minute facts through `current_cutoff` equals
  `passenger_validations_qty_now`.
- The previous-week projection uses the equivalent operational-minute cutoff.
- Selected-agency totals are sums of per-agency additive values.
- Re-running a refresh at the same source state is idempotent.
- Public ratios and percentiles are derived by Hub; they are not persisted as
  additive facts.

