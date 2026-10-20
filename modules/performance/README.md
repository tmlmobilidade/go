# Performance

Performance calculates its 41 dashboard metrics in ClickHouse SQL and reads their results through labDb. All implementation and SQL assets are local to this module.

## Storage

`sql/schema.sql` creates the `temp_performance` database and:

- `metric_rows`: structured, typed rows containing metric dimensions, nested-path keys, numeric values, nullable labels, boolean flags, and optional scalar values.
- `refreshes`: completed output ranges and their immutable run identifiers.
- `agencies` and `calendar`: versioned reference copies used by metric SQL.
- `rows_at`: a view selecting the newest completed generation for each output date from a pinned set of run identifiers.
- `retained_runs`: a view retaining recent generations and older last-good results.

The API reconstructs the existing JSON shape from these rows; it performs no metric aggregation, ranking, or comparison. Metric names, route paths, filters, agency identifier conventions, and UTC/Lisbon grouping conventions are preserved.

## Workers

| Worker | Interval after completion | Refresh |
| --- | --- | --- |
| `sync-metrics-realtime` | 30 seconds | Current/previous-week comparisons and Hub's existing agency-demand output. |
| `sync-metrics-hourly` | 1 hour | Seven operational days, future scheduled supply, and dependent rollups/rankings. |
| `sync-metrics-daily` | 24 hours | Full supported history, including corrections to hourly metric families, then safe cleanup. |

Workers execute `sql/metrics/*.sql` in the order declared in `packages/scripts/src/catalog.ts`. A first hourly run builds supported history before producing rollups. Legacy metric history starts on 2024-01-01; the separate Hub demand output retains its 2001-01-01 lower bound and all-agency scope.

Agencies are copied from `goDb.core.agencies` at startup and hourly. That loader is the only direct goDb data-access exception. Calendar metadata is copied from the existing public calendar API at startup and daily. A failed import retains its previous completed copy; dependent metrics cannot publish without a usable reference copy.

## Publication and failures

Each calculation writes immutable rows before publishing one completion record. Readers pin completed input generations. An older, slower calculation cannot supersede a newer result, and a successful empty range clears previous rows. Failed metrics retain their previous results; dependent jobs are skipped while independent jobs continue.

Daily cleanup removes obsolete or unpublished generations older than seven days. It preserves generations needed by current readers and retains a last-good result indefinitely during an outage. Inserts that precede a completion marker are synchronous, including reference copies, despite the shared client's asynchronous defaults.

Operational dates use normalized 04:00 Europe/Lisbon boundaries. This removes the old passenger-impact loop's accidental summer date rebasing and retained minute/second offsets; its distinct failed pattern/minute counts and exact historical median formula remain unchanged. Successful empty passenger-impact results now replace stale values.

## Unchanged consumers

Hub still reads `performance.demand_by_agency_by_operational_date`. Performance builds replacements in temporary staging tables and publishes complete monthly partitions to that existing table. Realtime owns the comparison months; daily owns older months. The existing source query deliberately retains its omission of `FINAL`. No Hub files or other existing Performance tables are changed.

Executive-summary exporters remain outside this change. They still read their last stored MongoDB metrics because Performance no longer writes MongoDB metric documents.

## Development and verification

From the repository root:

```sh
npm run build:performance
node --import tsx --test modules/performance/tests/build-compatibility.test.ts modules/performance/tests/metric-storage.test.ts
node --experimental-test-module-mocks --import tsx --test modules/performance/tests/sql-commands.test.ts
TSX_TSCONFIG_PATH=modules/performance/apps/frontend/tsconfig.json node --experimental-test-module-mocks --import tsx --test modules/performance/tests/frontend-data-provider.test.ts
node modules/performance/tests/verify-source-queries.mjs --static
```

With the configured staging credentials and tunnel:

```sh
ENVIRONMENT=dev node --env-file=environments/stg/.env.stg modules/performance/tests/initialize-storage.mjs
ENVIRONMENT=dev node --env-file=environments/stg/.env.stg modules/performance/tests/verify-source-queries.mjs --all
ENVIRONMENT=dev node --env-file=environments/stg/.env.stg modules/performance/tests/verify-storage.mjs
PERFORMANCE_VERIFY_SQL=1 ENVIRONMENT=dev node --env-file=environments/stg/.env.stg --experimental-test-module-mocks --import tsx --test modules/performance/tests/sql-commands.test.ts
```

The SQL verifier executes synthetic fixtures, validates formatted payloads against the existing metric schemas, and explains every production SELECT against the staging schema. The storage verifier writes isolated test generations in `temp_performance`, checks publication and retention, and deletes its test records afterward. Neither verifier runs the production metric workers or refreshes Hub output.

The module resolves SQL assets relative to its own package, which works in source, compiled workspaces, and the standard Docker layout without editing the shared SQL registry.
