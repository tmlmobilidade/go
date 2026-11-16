/* * */

import { type SQLiteDatabaseConfig } from '@tmlmobilidade/go-clients-sqlite';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';

/* * */

/**
 * Source of the GTFS ZIP archive. Provide exactly one path or URL.
 */
export type ImportGtfsConfigSource = { path: string, url?: never } | { path?: never, url: string };

/**
 * Optional inclusive date range and discrete service dates.
 * When both are set, a date must match both. An empty discrete list is ignored.
 */
export interface ImportGtfsConfigTimeRange {
	date_range?: { end: OperationalDateInt, start: OperationalDateInt }
	discrete_dates?: OperationalDateInt[]
}

/**
 * Configuration passed to the Go GTFS importer as JSON.
 */
export interface ImportGtfsConfig {
	/**
	 * Required local archive path or HTTP URL.
	 */
	source: ImportGtfsConfigSource

	/**
	 * Optional SQLite configuration. Defaults to a temporary database file.
	 * Database instances cannot be shared with the Go process.
	 * With memory: true, the result stays in memory and instancePath is ignored.
	 */
	sqlite_config?: Omit<SQLiteDatabaseConfig, 'databaseInstance'>

	/** Resolve service dates and filter trips and their dependencies. Omit for a raw import. */
	time_range?: ImportGtfsConfigTimeRange
}
