/* * */

import { StopIdSchema } from '@tmlmobilidade/go-types-infrastructure';
import { parseArgs } from 'node:util';

/* * */

export interface ImportOptions {
	agencyIds: string[]
	dryRun: boolean
	exportJson?: string
	file: string
	startId: number
}

/* * */

/**
 * Parses import options or displays help without opening database connections.
 * @param args The command-line arguments
 * @returns Validated options, or null when help was requested
 */
export function parseImportOptions(args = process.argv.slice(2)): ImportOptions | null {
	//

	//
	// Parse command-line options

	const { values } = parseArgs({
		args,
		options: {
			'agency-id': { multiple: true, type: 'string' },
			'dry-run': { default: false, type: 'boolean' },
			'export-json': { type: 'string' },
			'file': { type: 'string' },
			'help': { type: 'boolean' },
			'start-id': { default: '100000', type: 'string' },
		},
	});

	if (values.help) {
		console.log(`Import GTFS stops into GO infrastructure

Reads a local stops.txt, validates boarding stops, resolves administrative
locations, and inserts or exports draft stop documents.

Usage (from the repository root, using staging configuration):
  npm run helper:infrastructure:import-gtfs-stops -- [options]

Usage (inside this helper, with environment variables already loaded):
  npm run start -- [options]

Required options:
  --file <path>         Path to a readable UTF-8 GTFS stops.txt file.
                       Relative paths are resolved from the working directory.
  --agency-id <id>      Existing GO agency ID. Repeat for multiple agencies.
                       All supplied IDs are assigned to one flag per new stop.
                       Skips flags matching the GTFS stop ID and any supplied
                       agency, or a raw or agency-prefixed legacy ID match.

Optional options:
  --start-id <number>   First GO ID to try (default: 100000).
                       Must be an integer from 100000 to 999999.
                       Allocates sequential IDs, skipping occupied GO IDs and
                       numeric legacy IDs. Fails if the range is exhausted.
  --dry-run            Validate, resolve locations and print planned inserts
                       without writing stops. Still requires both databases.
                       Planned IDs are not reserved by the preview.
  --export-json <path> Write new stop documents as a JSON array to a new file
                       instead of inserting. Still requires both databases.
  --help               Show this help. No database connection is required.

Requirements:
  - Install workspace dependencies and build the helper's dependencies first:
      npm install
      npx turbo run build --filter='@tmlmobilidade/go-infrastructure-helpers-import-gtfs-stops^...'
  - Load GODB_* MongoDB and LOCATIONSDB_* PostgreSQL/PostGIS configuration,
    plus GO SSH tunnel configuration if your environment uses tunnels.
    The root helper command loads the repository's staging environment.
  - Every supplied agency must exist, and the locations database must cover the coordinates
    with all administrative divisions required by the location provider.
  - Required CSV headers: stop_id, stop_name, stop_lat, stop_lon.
    Boarding rows require nonempty values, unique stop_id values, a name of
    2-100 characters, latitude in [-90, 90] and longitude in [-180, 180].
    CSV quoting, escaped quotes, multiline values, BOM and CRLF are supported.

Import steps and functions:
  parseStops()   Parses CSV, checks required headers and duplicate IDs, and
                 selects location_type 0 or empty. Other valid types are skipped.
  toStop()       Maps the GTFS row to StopSchema: name, coordinates, generated
                 short_name, stop_desc as observations, generated tts_name,
                 agency flag, prefixed legacy IDs and system audit fields.
                 Uses schema defaults, including lifecycle_status=draft.
  parseImportOptions() validates CLI options and applies the default start ID.
  importStopsTask()    validates the file and agencies, skips existing flags or
                      legacy IDs, assigns IDs, resolves locations and logs
                      preparation, skips, inserts, exports and final counts.
                      All new documents are validated before export or insertion.
  main()              runs the task and closes database connections on exit.

Other GTFS fields, including stop_code, zone_id, stop_url, parent_station,
stop_timezone, wheelchair_boarding and tts_stop_name, are ignored.
Existing stops are not updated or deleted. The original stop_id is preserved
in the agency flag. Matches include existing deleted stops.

Examples:
  Preview in staging:
    npm run helper:infrastructure:import-gtfs-stops -- --file /path/stops.txt --agency-id 51 --dry-run
  Insert in staging (remove --dry-run):
    npm run helper:infrastructure:import-gtfs-stops -- --file /path/stops.txt --agency-id 51

Progress includes per-stop preparation, skips and inserts with elapsed time.
Completion prints prepared, inserted, exported, previewed and skipped counts. Errors exit with code 1.
An insertion error can leave a partial import; rerun with the same agency IDs to
skip completed inserts. Run one import per agency at a time.

See this helper's README.md for setup and the database-free test command.`);
		return null;
	}

	//
	// Validate the import options

	const agencyIds = [...new Set(values['agency-id']?.map(id => id.trim()))];
	const exportJson = values['export-json'];
	if (!values.file?.trim() || !agencyIds.length || agencyIds.includes('') || !/^\d{6}$/.test(values['start-id'] ?? '')) {
		throw new Error('Required: --file and --agency-id. Optional --start-id must be six digits (100000-999999). Use --help for usage.');
	}
	if (exportJson !== undefined && !exportJson.trim()) throw new Error('--export-json requires an output path.');

	return {
		agencyIds,
		dryRun: values['dry-run'],
		...(exportJson === undefined ? {} : { exportJson }),
		file: values.file,
		startId: Number(StopIdSchema.parse(values['start-id'])),
	};
}
