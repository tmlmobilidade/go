# Passenger demand metric

Temporary documentation for:

```text
GET /v2/metrics/passenger-demand
```

This note lives beside the endpoint until these semantics can be published in
the public API documentation.

## Purpose

The endpoint describes observed passenger-validation demand for one or more
agencies during the current operational date.

It is intended to answer two questions:

1. How many passenger validations have been observed so far?
2. Is current demand outside the range normally observed at the same point in
   comparable operational dates?

This is validation demand, not vehicle occupancy and not a count of distinct
passengers. Every accepted validation contributes one unit.

The current `definition_version` is `passenger-demand-v2`. It preserves
the existing accepted-status demand definition; consumers should retain the
version when storing or comparing metric results.

The operational date uses the `Europe/Lisbon` timezone and starts at 04:00.

## Request

`agency_ids` is required. It accepts one ID or a comma-separated list:

```text
GET /v2/metrics/passenger-demand?agency_ids=LA77N
GET /v2/metrics/passenger-demand?agency_ids=LA77N,BNA17
```

The response contains an entry for every requested agency. `total` represents
the selected set of agencies, not an implicit network-wide total.

## Comparable operational dates

The baseline uses the previous eight occurrences of the same calendar weekday.
They are calculated by subtracting 7, 14, …, 56 days from the current
operational date using JavaScript date arithmetic.

Holiday status, Offer year periods, and other calendar classifications do not
affect date selection. If a selected date has no usable source data, it is not
replaced with a different date and the available sample is smaller.

The dates actually used are returned in `meta.baseline_operational_dates`, and
their count is returned in `meta.baseline_sample_size`.

When multiple agencies are requested, combined reference values use only
comparable dates available to every selected agency.

## Current cumulative values

The following fields are cumulative values for the current operational date:

| Field | Meaning |
| --- | --- |
| `passenger_validations_qty_now` | Cumulative value from 04:00 through the latest completed minute at `meta.current_cutoff`. This is the value used for every comparison. |
| `passenger_validations_qty_last_week` | Cumulative value for the operational date seven days earlier at its equivalent cutoff. |
| `comparison_index_pct` | `passenger_validations_qty_now / passenger_validations_qty_last_week * 100`. This is an index: `100` means equal to last week. |

The current value, last-week value, typical median, and typical range all use
the same minute-of-operational-day cutoff.

For example, when the worker observes `16:03:27`, the latest fully closed
minute ends at `16:02:59.999`. The headline includes complete minutes from
04:00 through 16:02. Historical cumulative values are clipped after their
equivalent 16:02 minute. The still-open 16:03 minute appears after it closes
and the following refresh finishes.

This closed-minute delay is deliberate: it permits minute-level updates without
comparing a partial current minute with a complete historical minute.

## Typical cumulative reference

For every comparable operational date, the endpoint:

1. sums all one-minute validation counts from 04:00 through
   `meta.current_cutoff`;
2. produces one cumulative value for that date;
3. calculates percentiles across those daily cumulative values.

The result is exposed as:

| Field | Meaning |
| --- | --- |
| `typical_cumulative_qty` | 50th percentile: the median cumulative demand at this cutoff. |
| `typical_range.lower` | 25th percentile of cumulative demand at this cutoff. |
| `typical_range.upper` | 75th percentile of cumulative demand at this cutoff. |
| `typical_comparison_index_pct` | `passenger_validations_qty_now / typical_cumulative_qty * 100`. |

The typical range is an interquartile range, not the historical minimum and
maximum. The median is calculated from the same sample but is not necessarily
the arithmetic midpoint between the lower and upper bounds.

`deviation_status` is derived from `passenger_validations_qty_now`:

- `below_typical`: below the 25th percentile;
- `typical`: between the 25th and 75th percentiles, inclusive;
- `above_typical`: above the 75th percentile;
- `unavailable`: no valid baseline is available.

For example:

```text
current value:  127,200
typical median: 137,500
typical range:  120,900–138,400
```

The current value is approximately 7.5% below the median, but it is still
inside the interquartile range. Its status is therefore `typical`.

## Trend

`trend` represents demand during individual time buckets, not cumulative
demand.

The stored source fact has a one-minute grain. The publisher compacts those
facts into 15-minute trend buckets before caching the public snapshot. The
final bucket can contain between one and fifteen completed minutes when the
cutoff does not align with a complete 15-minute bucket.

Each trend point contains:

| Field | Meaning |
| --- | --- |
| `interval_start` | Start of the 15-minute bucket. |
| `passenger_validations_qty` | Current-date validations observed during that bucket. |
| `typical.median` | Median validations during the equivalent bucket across comparable dates. |
| `typical.lower` | 25th percentile for the equivalent bucket. |
| `typical.upper` | 75th percentile for the equivalent bucket. |

The median and percentiles are calculated independently for every bucket. A
typical trend visualization can therefore use:

- `passenger_validations_qty` as the current line;
- `typical.median` as the reference line;
- `typical.lower` to `typical.upper` as the reference band.

The band is not the minimum-to-maximum envelope.

## Availability and freshness

Consumers should inspect:

| Field | Meaning |
| --- | --- |
| `availability` | Whether an agency has demand data. |
| `meta.status` | `complete` when every requested agency is available; otherwise `partial`. |
| `meta.unavailable_agency_ids` | Requested agencies without data. |
| `meta.generated_at` | When the response snapshot was generated. |
| `meta.source_watermark` | Latest source event known to the metric publisher. |
| `meta.current_cutoff` | End of the latest completed minute used by the current and all reference values. |

When the selected set is partial, the endpoint does not expose a combined
`total` value or trend. Consumers should show agency availability explicitly
instead of treating unavailable data as measured zero.

## Recommended use

- Use `passenger_validations_qty_now` for the headline, gauge, and both
  last-week and typical comparisons.
- Use `comparison_index_pct` only for the equivalent-cutoff last-week
  comparison.
- Use `typical_comparison_index_pct` only for the comparable-date median
  comparison.
- Use the trend to show changes in the demand rate during the operational date.
- Do not describe deviations as causes. The endpoint indicates that demand is
  unusual, not why it is unusual.
