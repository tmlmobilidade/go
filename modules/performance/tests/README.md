# Performance source-query verification

Run from the repository root after installing workspace dependencies.

```sh
node modules/performance/tests/verify-source-queries.mjs --static
```

This checks all 16 source queries in the daily, hourly, and realtime workers: SQL uses explicit positional parameters, every parameter is supplied, versioned source tables use `FINAL`, and migrated files no longer read validations or rides from MongoDB.

To execute the SQL fixtures in ClickHouse and validate each query against the staging schema:

```sh
npm run repo:load-env-stg -- node modules/performance/tests/verify-source-queries.mjs --all
```

To check one updated source file before proceeding to another:

```sh
npm run repo:load-env-stg -- node modules/performance/tests/verify-source-queries.mjs modules/performance/apps/sync-metrics-hourly/src/syncs/demand_by_agency/by_day.ts
```

Without arguments the verifier accepts one source path per line, retaining its connection between checks. Each file is checked serially. The tests execute CTE fixtures with SELECT statements and run `EXPLAIN PLAN` against the real tables through `labDb`. They do not invoke the workers or delete/rebuild stored metrics.

The fixtures cover inclusive starts/exclusive ends, realtime inclusive cutoffs, out-of-scope agencies, non-passenger validations, nullable dimensions, empty windows, current versus previous-week counts, missing analyses, zero passengers, valid versus failed rides, scheduled versus observed extensions, revenue conversion from cents, delay thresholds, historical observed-time filtering, and winter/summer UTC versus Lisbon grouping.

## Migration contracts

- Validations use GO agency IDs to filter ClickHouse data. `agency_code` preserves the existing legacy agency keys in generated demand metrics.
- Ride `route_short_name` and `shape_id` replace the old `line_id` and `pattern_id` fields.
- `processing_status` replaces `system_status`; ride analysis grades and start-time deltas come from separate analysis tables.
- Every versioned source is read with `FINAL` so older versions do not inflate aggregates. Counts and sums returned from UInt64 aggregates are converted to Float64 to remain JavaScript numbers in JSONEachRow.
- Pattern/hour dashboards retain their original UTC buckets. Passenger-impact pattern/hour keys retain Europe/Lisbon local time.
- Realtime demand uses one frozen reference time and excludes future timestamps from today's count.
- Generated metric documents and their MongoDB rollups use `goDb.performance.metrics` (`performance.metrics` in the GO MongoDB connection). The API and export consumers read from the same interface. Calendar enrichment and agency pricing retain their existing sources. Supply revenue retains its existing formula, including the subscription quantity contribution.
- The storage schema validates the discriminated metric payload while retaining the ID and timestamps added by the GoDB collection interface. Existing legacy records are not copied by this code change; workers regenerate their results in the new collection.

Build the entire Performance module and run the date/calendar compatibility regressions with:

```sh
npm run build:performance
node --import tsx --test modules/performance/tests/build-compatibility.test.ts modules/performance/tests/metric-storage.test.ts
```

The compatibility tests check operational-day selection across Lisbon clock changes, clearing filters, and calendar metadata/failure handling. Workers access the existing calendar API through a shared adapter while using the current date utility for their calculations.
