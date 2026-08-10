# VKM vs GTFS export alignment checks

Auxiliary scripts to explain gaps between:

- **VKM explorer** (`calculateAgencyVkm` → `computeActiveRules` × extension)
- **GTFS comparator** (exported `trips.txt` × `calendar_dates.txt` × distance)

All three scripts are wired as npm scripts in the `gtfs-exporter`
[`package.json`](../../../package.json). Run them **from
`modules/offer/apps/gtfs-exporter`** — each npm script already loads the staging
`.env` (via `dotenv-run`), so you do **not** need to `source` it yourself.

```bash
cd modules/offer/apps/gtfs-exporter
```

Pass script flags after a `--` separator so npm forwards them to the script:

```bash
npm run vkm:check -- --agency 44 --start 20260101 --gtfs output_44
```

## Prerequisites

- **A GTFS export folder.** Produce one with `npm run dev:local` (writes
  `output_<agency>/` in this app), then point `--gtfs` at it. Paths are relative
  to the gtfs-exporter dir, e.g. `--gtfs output_44`.
- **Mongo access.** The staging `.env` (loaded by the npm scripts) must provide
  `DATABASE_URI`. The scripts read offer data through `@tmlmobilidade/interfaces`.

## Scripts

### `npm run vkm:check` — one-shot VKM + circulation summary

Script: [`compare-vkm-summary.ts`](./compare-vkm-summary.ts).

**Use it first.** Top-level reconciliation of GO VKM vs gtfs-comparator VKM for a
whole agency: total km, circulation-days, duplicate-row inflation, and the top
patterns ranked by km delta. It prints a ready-to-paste `vkm:dates` command for
the worst offenders so you can drill down.

```bash
# Interactive — prompts for agency, start date, and GTFS folder:
npm run vkm:check

# Non-interactive:
npm run vkm:check -- --agency 44 --start 20260101 --gtfs output_44

# Save reports:
npm run vkm:check -- --agency 44 --start 20260101 --gtfs output_44 --json /tmp/vkm-44.json
npm run vkm:check -- --agency 44 --start 20260101 --gtfs output_44 --csv /tmp/vkm-44.csv
```

| Flag | Default | Purpose |
|------|---------|---------|
| `--agency` | _(prompted)_ | Agency id |
| `--start` | _(prompted)_ | Window start `YYYYMMDD`; window is `start` → `start + 1 year` (ano móvel) |
| `--gtfs` | _(prompted)_ | Path to the export folder (relative to this app) |
| `--json` | — | Write the full report as JSON |
| `--csv` | — | Write per-pattern rows as CSV (Excel-friendly) |
| `--limit` | `25` | How many top-delta patterns to print |
| `--only-routed` | off | Restrict to patterns that own a live route (same inventory as the export) |

### `npm run vkm:dates` — date / timepoint drill-down

Script: [`compare-circulation-dates.ts`](./compare-circulation-dates.ts).

**Use it second**, on the patterns `vkm:check` flagged. For each pattern it lines
up the GTFS calendar against GO's `computeActiveRules` and lists exactly which
dates / timepoints one side has and the other does not — the residual circulation
gap behind the km delta.

```bash
# One or more patterns (comma-separated):
npm run vkm:dates -- --agency 44 --start 20260101 --gtfs output_44 --pattern 4432_0_1

# Top N patterns by day delta (no --pattern needed):
npm run vkm:dates -- --agency 44 --start 20260101 --gtfs output_44 --top 5

# Every pattern with any delta:
npm run vkm:dates -- --agency 44 --start 20260101 --gtfs output_44 --all-with-delta

# Inspect a single date (e.g. férias same-weekday sanity check):
npm run vkm:dates -- --agency 44 --start 20260101 --gtfs output_44 --pattern 4432_0_1 --date 20260407

# Export the missing slots to CSV:
npm run vkm:dates -- --agency 44 --start 20260101 --gtfs output_44 --pattern 4432_0_1 --csv /tmp/missing.csv
```

| Flag | Default | Purpose |
|------|---------|---------|
| `--agency` | `42` | Agency id |
| `--start` | `20260101` | Window start `YYYYMMDD` (ano móvel) |
| `--gtfs` | _(required)_ | Path to the export folder |
| `--pattern` | — | Pattern code(s), comma-separated; omit to use `--top` / `--all-with-delta` |
| `--top` | `5` | Top patterns by day delta when no `--pattern` given |
| `--all-with-delta` | off | Include every pattern with a non-zero delta |
| `--date` | — | Restrict the report to a single `YYYYMMDD` |
| `--max-detail` | `40` | Max date/timepoint rows printed per pattern |
| `--json` | — | Write the report as JSON |
| `--csv` | — | Write the missing slots as CSV |

### `npm run rules:overlaps` — overlapping-rule scanner

Script: [`scan-overlapping-timepoints.ts`](./scan-overlapping-timepoints.ts).

**Use it to explain `service_id` suffixes**, not VKM totals (it needs no `--gtfs`).
It scans a pattern's INCLUDE rules for timepoints covered by two or more
overlapping rules — the double-bookings that force the ` 2` / ` 3` numeric
suffixes on GTFS `service_id`s. The classic safe-to-fix case: a weekday rule (DU)
whose scope is a strict subset of an all-days rule; the shared timepoint can be
dropped from the subset rule with no loss.

```bash
npm run rules:overlaps -- --agency 44

# Routed patterns only:
npm run rules:overlaps -- --agency 44 --only-routed

# Specific patterns:
npm run rules:overlaps -- --agency 44 --pattern 1740_0_1,1741_0_2

# Save reports:
npm run rules:overlaps -- --agency 44 --json /tmp/overlaps-44.json --csv /tmp/overlaps-44.csv
```

| Flag | Default | Purpose |
|------|---------|---------|
| `--agency` | _(prompted)_ | Agency id |
| `--pattern` | — | Pattern code(s), comma-separated; omit to scan the whole agency |
| `--only-routed` | off | Restrict to patterns that own a live route |
| `--json` | — | Write the report as JSON |
| `--csv` | — | Write the overlaps as CSV |

## Interpreting results

`vkm:check` reports **metre-days** (Σ distance × circulation days) alongside km:

- If **metre-days** differ by a large margin, the residual gap is circulation
  and/or extension — drill in with `vkm:dates`.
- If metre-days match but km labels differ, it is rounding/display only.

Agency 41 matching to the decimal and agency 42 within ~0.01% after cleaning
orphans usually means an **offer-data alignment** issue, not a broken VKM
implementation.

After changing `@tmlmobilidade/dates`, rebuild it before re-exporting:

```bash
npm run build -w @tmlmobilidade/dates
cd modules/offer/apps/gtfs-exporter && npm run dev:local
```

## Files

| File | Purpose | npm script |
|------|---------|------------|
| [`compare-vkm-summary.ts`](./compare-vkm-summary.ts) | One-shot GO vs GTFS VKM + circulation summary with duplicate-row split | `vkm:check` |
| [`compare-circulation-dates.ts`](./compare-circulation-dates.ts) | Per date/timepoint: GTFS calendar vs GO `computeActiveRules` | `vkm:dates` |
| [`scan-overlapping-timepoints.ts`](./scan-overlapping-timepoints.ts) | Overlapping INCLUDE rules behind `service_id` suffixes | `rules:overlaps` |
| [`gtfs-export-io.ts`](./gtfs-export-io.ts) | Shared GTFS CSV loaders used by the comparison scripts | — |
