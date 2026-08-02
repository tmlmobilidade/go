/* * */

import { type GtfsSQLTables } from '@/types/sql-tables.js';

/**
 * Context object used throughout the GTFS import process.
 * It contains counters for various entities, references to GTFS SQL tables,
 * the original plan metadata, sets of referenced IDs, and paths for working directories.
 */
export interface ImportGtfsContext {
	counters: {
		calendar_dates: number
		hashed_shapes: number
		hashed_trips: number
		shapes: number
		stop_times: number
		trips: number
	}
	gtfs: GtfsSQLTables
	referenced_route_ids: Set<string>
	referenced_shape_ids: Set<string>
	run_id: string
	workdir: {
		download_file_path: string
		extract_dir_path: string
		path: string
	}
}
