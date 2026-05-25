/* * */

import { type ImportGtfsContext } from '@/types/context.js';
import { initGtfsSqlTables } from '@/utils/init-tables.js';
import { Dates } from '@tmlmobilidade/dates';

/**
 * Initializes the context for the GTFS import process.
 * @returns The initialized context for the GTFS import process.
 */
export function initImportGtfsContext(): ImportGtfsContext {
	//

	//
	// Generate a timestamp string to be used as the
	// identifier for this import run.

	const runId = Dates.now('Europe/Lisbon').toFormat('yyyyLLdd-HHmm-ss');

	//
	// Use the run ID to prepare the working directory.

	const workdirContext: ImportGtfsContext['workdir'] = {
		download_file_path: `/tmp/import-gtfs/${runId}/${runId}.zip`,
		extract_dir_path: `/tmp/import-gtfs/${runId}/${runId}/extracted`,
		path: `/tmp/import-gtfs/${runId}`,
	};

	//
	// Setup the counters for the import process.

	const countersContext: ImportGtfsContext['counters'] = {
		calendar_dates: 0,
		hashed_shapes: 0,
		hashed_trips: 0,
		shapes: 0,
		stop_times: 0,
		trips: 0,
	};

	//
	// Setup the GTFS SQL tables.

	const gtfsTablesContext = initGtfsSqlTables();

	//
	// Return the initialized context.

	return {
		counters: countersContext,
		gtfs: gtfsTablesContext,
		referenced_route_ids: new Set<string>(),
		referenced_shape_ids: new Set<string>(),
		run_id: runId,
		workdir: workdirContext,
	};
}
