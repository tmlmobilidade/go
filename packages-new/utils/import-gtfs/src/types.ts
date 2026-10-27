/* * */

import { type SQLiteDatabase, type SQLiteDatabaseConfig, type SQLiteTableInstance } from '@tmlmobilidade/go-clients-sqlite';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';

/* * */

/**
 * Source of the GTFS ZIP archive. Provide exactly one path or URL.
 */
export type ImportGtfsConfigSource = {
	path: string
	url?: never
} | {
	path?: never
	url: string
};

/**
 * Optional inclusive date range and discrete service dates.
 * When both are set, a date must match both. An empty discrete list is ignored.
 */
export interface ImportGtfsConfigTimeRange {
	date_range?: {
		end: OperationalDateInt
		start: OperationalDateInt
	}
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

/* * */

/**
 * An imported CSV row. Column names are dynamic; empty fields are null.
 */
export type GtfsRow = Record<string, null | string>;

/**
 * The opened SQLite database and its GTFS tables.
 * Missing or empty source files have undefined table handles.
 * calendar_dates groups added service dates (exception_type = 1) by service ID.
 * With a nonempty time_range filter, dates include expanded weekly calendars
 * and applied exceptions. Raw rows remain accessible through _db.
 * Call _db.cleanup() to close the database and delete its file, if any.
 */
export interface GtfsSQLTables<T = GtfsRow> {
	_db: SQLiteDatabase
	calendar_dates: Record<string, OperationalDateInt[]>
	routes: SQLiteTableInstance<T>
	shapes: SQLiteTableInstance<T>
	stop_times: SQLiteTableInstance<T>
	stops: SQLiteTableInstance<T>
	trips: SQLiteTableInstance<T>
}
