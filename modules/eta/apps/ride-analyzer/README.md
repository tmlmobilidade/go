# ETA Ride Analyzer

Integration harness for inspecting how the ETA pipeline behaves for a single ride.

The analyzer:

1. Bootstraps `eta_dev` by running the standard loader (`@tmlmobilidade/go-eta-pckg-loader`) for the chosen `--line-ids` and `--time-start` window, then forces a synchronous refresh of `mv_pred_node_etas` so the predicted node travel times are populated before the replay.
2. Reads every `operation.simplified_vehicle_events` row for the chosen `--trip-id`, ordered by `created_at`.
3. For each event in turn, replays it through the pipeline using SQL under [`modules/eta/sql/test/`](../../sql/test/):
   - [`sync-curr-vehicle-event.sql`](../../sql/test/sync-curr-vehicle-event.sql) inserts the snapped position into `eta_dev.curr_vehicle_events` (mirroring `mv_curr_vehicle_events` for a single event id).
   - [`replay-pred-trip-stop-etas.sql`](../../sql/test/replay-pred-trip-stop-etas.sql) computes stop ETAs from the cumulative contents of `curr_vehicle_events`, treating the event's `created_at` as the wall clock. The query mirrors `mv_pred_trip_stop_etas` and inlines the enrichment from `api/2-select-pred-trip-stop-etas-by-trip-id.sql`, so the rows it returns match the API response shape.
4. Saves the per-event snapshots to `summary.json` and a flat `etas.csv` for spreadsheet analysis.

The replay SQL deliberately bypasses the `pred_trip_stop_etas` storage path so per-event snapshots aren't affected by the asynchronous `ReplacingMergeTree` merge cadence.

## Usage

From the repo root:

```bash
npm run test:eta:ride -- \
  --line-ids 1215 \
  --time-start 1779062400000 \
  --trip-id "6R5PX-44-20260525-4701_0_1|2500|1930"
```

| Flag | Required | Description |
|------|----------|-------------|
| `--line-ids` | yes | Comma-separated mongo ride line ids fed to the loader (e.g. `1215` or `1215,1216`). |
| `--time-start` | yes | Start of the loader's dev window as a millisecond unix timestamp; the analyzer uses `[start, start + 1h]`. |
| `--trip-id` | yes | **Ride id** (e.g. `6R5PX-44-20260525-4701_0_1\|2500\|1930`) or bare **trip id** (`4701_0_1\|2500\|1930`). Ride ids are split into `trip_id` + `operational_date` for ClickHouse; bare trip ids use `operational_date` from `--time-start`. |
| `--output-dir` | no | Output directory. Defaults to `modules/eta/output/ride-analyzer/<sanitized-trip-id>-<timestamp>/`. |
| `--skip-loader` | no | Skip the loader phase when the ETA database is already seeded for this trip. |

## Output

| File | Description |
|------|-------------|
| `summary.json` | Run metadata (CLI args, timings, event counts) plus the full per-event snapshots, including the inserted `curr_vehicle_events` row and the enriched ETA list. |
| `etas.csv` | Flat `(event × stop)` table with `event_index`, `event_id`, `event_created_at`, `node_index`, `stop_sequence`, `stop_id`, scheduled / observed / estimated arrival columns, and `eta_seconds`. |

## Requirements

- `ENVIRONMENT=dev` so the ETA module targets `eta_dev` (the script sets this automatically).
- `modules/eta/environments/staging/secrets/.env` available with the standard ETA Mongo + ClickHouse credentials.
- `operation.simplified_vehicle_events` already contains rows for `--trip-id` within the loader's historical window.
