# Performance verification

See [the module README](../README.md#development-and-verification) for commands.

- `build-compatibility.test.ts`: Lisbon daylight-saving boundaries, date-filter clearing, public-calendar validation and failure handling.
- `frontend-data-provider.test.ts`: the widget provider supplies an SWR fetcher, unwraps API payloads (including empty arrays), and exposes request failures to SWR.
- `metric-storage.test.ts`: compatible historical/realtime/ranking payloads, numeric pattern-hour dimensions, prototype-safe identifiers, date filters, SQL asset lookup, and the complete ordered 41-metric catalogue.
- `sql-commands.test.ts`: staging identifiers are safely bound before executing demand commands. With `PERFORMANCE_VERIFY_SQL=1`, ClickHouse parses every command via `EXPLAIN AST` without executing writes.
- `verify-source-queries.mjs --static`: all 41 working metrics have run-tagged SQL assets.
- `verify-source-queries.mjs --all`: executes deterministic fixtures, validates the resulting legacy API schemas, and runs `EXPLAIN PLAN` for every production SELECT. Checks include passenger filters, null dimensions, calendar flag types, day/month/year rollups, supply pricing/revenue, exact even-count medians, ranking baselines, and realtime totals.
- `verify-storage.mjs`: exercises the real snapshot view with isolated test records. Covers unpublished failures, older overlapping runs, disjoint ranges, empty replacements, deletion of obsolete generations, and retention of an old last-good result. Cleanup removes its test records even on failure.
- `initialize-storage.mjs`: applies only the module-owned `temp_performance` schema and views through the configured labDb connection.

Source data is never modified by these verifiers. No workers are deployed or left running.
