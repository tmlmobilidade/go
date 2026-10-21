# Import GTFS stops

Node.js/TypeScript helper that reads a local standard GTFS `stops.txt`, validates it with `StopSchema`, resolves administrative locations, and inserts through `goDb.infrastructure.stops` (`InfrastructureDatabase`).

Display the full command-line help without loading database configuration:

```sh
npm run start --workspace=@tmlmobilidade/go-infrastructure-helpers-import-gtfs-stops -- --help
```

## Options and requirements

| Option | Required | Purpose |
| --- | --- | --- |
| `--file <path>` | Yes | Readable UTF-8 GTFS `stops.txt`. Relative paths resolve from the working directory. |
| `--agency-id <id>` | Yes | Existing GO agency ID assigned to each stop flag. This is not the GTFS agency ID. |
| `--start-id <number>` | No | First sequential GO ID to try (default: `100000`), an integer from `100000` to `999999`. |
| `--dry-run` | No | Validate and preview without inserting. Requires database connections and does not reserve IDs. |
| `--help` | No | Explain options, requirements, functions, mapping and examples without connecting to databases. |

The CSV must contain unique headers including `stop_id`, `stop_name`, `stop_lat` and `stop_lon`. Boarding rows need nonempty values, a name of 2–100 characters, latitude between -90 and 90, and longitude between -180 and 180. Stop IDs must be unique across the file.

Import and preview require GODB MongoDB and LOCATIONSDB PostgreSQL/PostGIS configuration, plus GO SSH tunnel settings when used by the environment. The agency must exist and the locations database must resolve all required administrative divisions for each new stop.

## Structure and functions

```text
src/
├── index.ts                 # CLI entry point, logger and connection cleanup
├── tasks/import-stops.ts    # Preparation, duplicate checks and database writes
├── utils/cli.ts             # Option validation and help
├── utils/stops.ts           # CSV parsing and StopSchema mapping
└── import.test.ts           # Offline parser and import workflow checks
```

- `parseImportOptions(args)` validates CLI arguments, applies the default start ID and handles help without opening connections.
- `parseStops(text)` parses CSV, validates headers and stop IDs, checks location types, and selects boarding stops and platforms.
- `toStop(row, id, location, agencyId)` maps one GTFS row into a document validated with `StopSchema`, using the supplied GO ID, location and agency.
- `importStopsTask(options)` reads and validates the file, checks the agency, skips existing stops, assigns IDs and resolves locations. It prepares all new documents before previewing or inserting them and returns the counts. Database and location operations can be supplied by offline checks.
- `main()` parses CLI options, initializes the GO logger and runs the task. The entry point closes database connections and exits with code 1 on errors.

## Setup and usage

From the repository root, install workspace dependencies with `npm install` and build the helper's dependencies:

```sh
npx turbo run build --filter='@tmlmobilidade/go-infrastructure-helpers-import-gtfs-stops^...'
```

Preview against staging using the repository's environment loader:

```sh
npm run helper:infrastructure:import-gtfs-stops -- --file /absolute/path/stops.txt --agency-id 51 --dry-run
```

Remove `--dry-run` to insert. IDs start at `100000` by default; optionally pass `--start-id 700000` to choose a different starting point. Occupied GO IDs and legacy IDs are skipped, and exhaustion beyond `999999` fails. The preview requires the same GODB and LOCATIONSDB connections as the import. For another environment, load its configuration before running the workspace's `start` script.

- `stop_id` stays a string (including leading zeroes) in the agency flag. `${agencyId}:${stop_id}` is stored in `legacy_id` and `legacy_ids`. Stops are skipped when the same flag contains both the GTFS stop ID and the selected agency ID (`$elemMatch`). Identical IDs for another agency, or matches spread across different flags, do not match. Matching agency-prefixed `legacy_id` or `legacy_ids` also skips a stop. Existing stops, including deleted stops, are not updated. GTFS stop IDs must be unique across feeds imported for the same agency.
- `stop_name` is converted to title case for `name`; the existing helpers generate `short_name` and `tts_name`. `stop_lat`/`stop_lon` map to coordinates and `stop_desc` to observations. Audit fields use `system`; other fields use schema defaults, including draft lifecycle status.
- Only `location_type=0` or empty becomes a GO stop; stations, entrances, generic nodes and boarding areas are skipped. Fields without a matching GO field (including `stop_code`, `zone_id`, `stop_url`, `parent_station`, `stop_timezone`, `wheelchair_boarding` and `tts_stop_name`) are ignored.
- CSV parsing supports UTF-8 BOM, quoted commas, escaped quotes, multiline values, CRLF and blank lines. Missing required fields, duplicate IDs, invalid coordinates and invalid GO documents fail the import.
- All new documents and locations are prepared before insertion. Database errors during insertion can leave a partial import; re-run with the same agency ID to skip completed inserts. Run one import per agency at a time.

## Progress and failures

GO telemetry logs show the input file and mode, parsed boarding stop count, agency check, preparation progress (`[current/total]`), location resolution, and the existing GO ID for each skipped stop. A second pass logs each insert or preview. Completion and failure summaries include prepared, inserted, previewed and skipped counts plus elapsed time. Prepared counts include documents skipped by the final duplicate recheck.

Before each insert, the task rechecks flag and legacy matches so a stop created during preparation can be skipped. This is not an atomic uniqueness guarantee; keep one importer per agency running at a time. Errors identify the phase and current GTFS/GO stop. Validation or location errors occur before any write; an insertion error may leave completed inserts behind.

Run the parser, CLI and import workflow checks without database connections:

```sh
npm run test --workspace=@tmlmobilidade/go-infrastructure-helpers-import-gtfs-stops
```
