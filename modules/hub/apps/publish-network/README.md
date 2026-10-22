# Publish network

Publishes Hub network data every ten minutes, grouped by agency, and maintains the global feeds used by existing consumers.

## Sources and eligibility

- Agencies are the distinct agency IDs belonging to organizations with `open_data.enabled`.
- Plans come directly from `goDb.operation.plans`. Their normalized operation GTFS attachments are imported through the storage provider; this worker does not consume the generated feed or publication status from `publish-gtfs`.
- Current and future plans with activation dates and normalized attachments are eligible. Expired plans are excluded using the Lisbon operational date.
- Current plans retain service dates from `20010101` through `active_until`, matching the GTFS publisher. Future plans use their `active_from` and `active_until` bounds.
- Stop metadata comes from `goDb.infrastructure.stops`. Source stop IDs resolve through canonical IDs, agency flags, and legacy IDs; canonical ID lookup is the fallback. Deleted or unresolved stops fail the agency build.

## Combining plans

All eligible plans contribute schedules. Route metadata takes the first definition according to this precedence:

1. Current plans before future plans.
2. Latest `active_from`.
3. Latest `updated_at`.
4. Ascending plan ID as a deterministic tie breaker.

Public route, pattern, trip, service, and shape IDs use the same qualifiers as the GTFS publisher. Pattern version hashing, schedule grouping, and the associated explanatory comments retain their existing behavior.

Polyline caches belong to each imported database. Every successfully imported database is closed in a `finally` block.

## Cache publication

The agency namespace is `hub:v1:<agencyId>:network`; the compatible global namespace is `hub:v1:network`.

| Suffix | Format |
| --- | --- |
| `stops`, `lines`, `routes` | JSON array |
| `stops:<id>`, `lines:<id>`, `routes:<id>` | `setNew` envelope containing one entity |
| `patterns:<id>` | `setNew` envelope containing the pattern versions |

Agency stop entries contain only that agency's flags and network references. Global stop entries merge those associations while retaining the canonical stop ID.

An agency is built and validated completely before its cache is replaced. If a plan import, stop resolution, or transformation fails, its last successful agency network remains available and contributes to the global feed. During migration, the previous global cache supplies that fallback when no agency cache exists yet. Other agencies continue processing.

An enabled agency with no eligible plans publishes empty lists. Successful publication removes obsolete stop, line, route, and pattern keys within that namespace. Agencies that lose open-data eligibility are removed from both agency caches and the rebuilt global network.
