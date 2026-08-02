/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type GtfsDate } from '@tmlmobilidade/go-types-gtfs';

/**
 * Source type of the GTFS data to import.
 */
type ImportGtfsConfigSource = {
	path: string
} | {
	url: string
};

/**
 * Time range type of the GTFS data to import.
 */
interface ImportGtfsConfigTimeRange {
	date_range?: {
		end: GtfsDate
		start: GtfsDate
	}
	discrete_dates?: (GtfsDate)[]
}

/**
 * Configuration options for importing GTFS data.
 * Source is required, time range is optional.
 */
export interface ImportGtfsConfig {
	source: ImportGtfsConfigSource
	time_range?: ImportGtfsConfigTimeRange
}

/**
 * Context object used throughout the GTFS import process.
 * It contains counters for various entities, references to GTFS SQL tables,
 * the original plan metadata, sets of referenced IDs, and paths for working directories.
 */
export interface ImportGtfsContext<T> {
	config: ImportGtfsConfig
	counters: {
		calendar_dates: number
		hashed_shapes: number
		hashed_trips: number
		shapes: number
		stop_times: number
		trips: number
	}
	gtfs: T
	referenced_route_ids: Set<string>
	referenced_shape_ids: Set<string>
	run_id: string
	workdir: {
		download_file_path: string
		extract_dir_path: string
		path: string
	}
}

/**
 * Initializes the context for the GTFS import process.
 * @returns The initialized context for the GTFS import process.
 */
export function initImportGtfsContext<T>(sqlTables: T, config: ImportGtfsConfig): ImportGtfsContext<T> {
	//

	//
	// Generate a timestamp string to be used as the
	// identifier for this import run.

	const runId = Dates.now('Europe/Lisbon').toFormat('yyyyLLdd-HHmm-ss');

	//
	// Use the run ID to prepare the working directory.

	const workdirContext: ImportGtfsContext<T>['workdir'] = {
		download_file_path: `/tmp/import-gtfs/${runId}/${runId}.zip`,
		extract_dir_path: `/tmp/import-gtfs/${runId}/${runId}/extracted`,
		path: `/tmp/import-gtfs/${runId}`,
	};

	//
	// Setup the counters for the import process.

	const countersContext: ImportGtfsContext<T>['counters'] = {
		calendar_dates: 0,
		hashed_shapes: 0,
		hashed_trips: 0,
		shapes: 0,
		stop_times: 0,
		trips: 0,
	};

	//
	// Return the initialized context.

	return {
		config: config,
		counters: countersContext,
		gtfs: sqlTables,
		referenced_route_ids: new Set<string>(),
		referenced_shape_ids: new Set<string>(),
		run_id: runId,
		workdir: workdirContext,
	};
}
