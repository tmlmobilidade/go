# Passenger Demand Publication

## Data flow

Hub publishes demand that Performance has already reconciled:

```text
Performance one-minute facts and current projection
  -> hub/publish-metrics
  -> hub:v2:metrics:passenger-demand:json
  -> GET /v2/metrics/passenger-demand
  -> Videowall DemandCard
```

The publisher runs independently from the API. A failed calculation does not
overwrite the last valid cache snapshot.

The detailed public field semantics live beside the endpoint in
`modules/hub/apps/api/src/endpoints/v2/metrics/passenger-demand.md`.
The Performance refresh and storage rules are documented in
`modules/performance/docs/passenger-demand-metrics.md`.

## Publisher

Every publication reads:

- the current `performance.passenger_demand_realtime` rows;
- one-minute facts for the current operational date;
- one-minute facts for the previous eight matching weekdays.

The publisher calculates comparable dates by subtracting 7, 14, …, 56 calendar
days in JavaScript. It does not use holidays, Offer periods, or a persisted
reference-date table.

The cached snapshot keeps additive data by agency so the API can assemble any
caller-selected agency set correctly. It contains:

- current and previous-week cumulative values from the realtime projection;
- current-date trend points;
- trend points for every available comparable date;
- cutoff, operational date, source watermark, and definition version.

One-minute facts are compacted into 15-minute trend buckets before caching.
The bucket containing the cutoff is intentionally partial: at `16:03:27`, the
latest closed minute is 16:02, so the 16:00 bucket contains only 16:00, 16:01,
and 16:02. Historical dates are clipped to the same operational-minute index.

The combined transitional `/v2/metrics/videowall` publication also obtains its
demand headline from `passenger_demand_realtime`; it no longer performs a
second direct validation calculation. Its service fields remain a separate
legacy-compatible projection.

## API selection and calculations

`GET /v2/metrics/passenger-demand` requires `agency_ids`. The API selects those
agencies from the cached snapshot and calculates one combined `total` for
exactly that set.

For multiple agencies, additive counts are summed first. Ratios and
percentiles are calculated afterwards; agency ratios or medians are never
added together.

### Headline and previous week

```text
now = sum(selected agencies' passenger_validations_qty_now)
last_week = sum(selected agencies' passenger_validations_qty_last_week)
comparison_index_pct = now / last_week * 100
```

`comparison_index_pct` is an index: `100` means equal to the equivalent cutoff
seven days earlier.

### Typical cumulative reference

Only comparable operational dates available to every selected agency are used.
For each such date, the API:

1. sums all selected agencies in every 15-minute bucket through the current
   cutoff;
2. produces one cumulative value for that date;
3. calculates the 25th percentile, median, and 75th percentile across those
   daily values.

The result drives the Videowall gauge:

- `typical_range.lower`: 25th percentile;
- `typical_cumulative_qty`: median;
- `typical_range.upper`: 75th percentile;
- `typical_comparison_index_pct = now / median * 100`.

The range is the interquartile range, not the minimum and maximum. The median
is not necessarily the midpoint of the lower and upper values.

### Trend reference

Trend values are per-bucket counts, not cumulative totals. For every 15-minute
bucket, the API independently calculates the 25th percentile, median, and 75th
percentile across comparable dates.

The Videowall renders:

- current bucket count as the blue line;
- historical median as the dashed reference line;
- 25th-to-75th percentile interval as the gray reference band.

## Availability

The response reports unavailable requested agencies explicitly. If any agency
in the selected set is unavailable, the combined `total` is omitted rather
than treating missing data as zero.

Consumers should use `meta.generated_at`, `meta.current_cutoff`, and
`meta.source_watermark` to distinguish publication time, comparison cutoff,
and source freshness.
