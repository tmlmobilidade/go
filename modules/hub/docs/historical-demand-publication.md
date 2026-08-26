# Historical Demand Publication

## Ownership and data flow

Performance owns the canonical calculations. Hub owns publication and Redis:

```text
performance.passenger_demand_by_dimensions_by_day
  -> @tmlmobilidade/go-performance-pckg-scripts
  -> hub/publish-metrics
  -> Hub-owned Redis keys
  -> future Hub public API endpoints
```

The Hub publisher calls the same `queryDailyPassengerDemandOverTimeByAgency`, `queryDailyPassengerDemandOverTimeByLine`,
and `queryDailyPassengerDemandOverTimeByPattern` functions used by the Performance API. It does not
duplicate their ClickHouse calculations.

## Cadence

Historical demand is published once per ten-minute slot. The
`publish-metrics` process still runs every 30 seconds for realtime metrics, but
the task-level guards avoid rerunning successful historical publications in
the same slot. A failed dimension remains eligible for retry on the next
30-second process cycle.

Agency, line, and pattern publications run sequentially so their nine
full-history grain queries are not all sent to ClickHouse simultaneously. Each
dimension still calculates `day`, `month`, and `year` concurrently.

## Cache values

Agency remains a single low-cardinality value containing every agency:

```text
hub:v2:metrics:historical:demand-by-agency:json
```

Lines and patterns use one value per entity:

```text
hub:v2:metrics:historical:demand-by-line:1201:json
hub:v2:metrics:historical:demand-by-pattern:1201_0_1:json
```

Each line or pattern value contains one validated metric for every supported
time grain:

```json
{
  "day": {},
  "month": {},
  "year": {}
}
```

The publisher ignores the internal `__unknown__` dimension member. All current
entity values are written with one Redis `MSET`; stale line or pattern keys are
removed only after that replacement succeeds. An empty calculation is rejected
so it cannot erase the last valid publication.

The publisher logs the entity count and total serialized bytes for line and
pattern publications. This gives deployment-level evidence for Redis capacity
and future partitioning decisions.

These caches are separate from
`hub:v2:metrics:realtime:passenger-demand:json`, which is the intraday
Videowall snapshot with current-cutoff and historical-reference data.
