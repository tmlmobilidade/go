/* * */

import { type GtfsStrictV29Route, type GtfsStrictV29Shape, type GtfsStrictV29Stops, type GtfsStrictV29StopTimes, type GtfsStrictV29Trips } from '@tmlmobilidade/go-types-gtfs-strict';
import { type OperationalDate } from '@tmlmobilidade/go-types-shared';
import { type SQLiteDatabase, type SQLiteTableInstance } from '@tmlmobilidade/sqlite';

/**
 * Holds references to all GTFS-related SQL tables.
 * Each property corresponds to a specific GTFS entity and is associated
 * with a `SQLiteTableInstance` instance for that entity. This structure
 * allows for organized access and manipulation of GTFS data within the database,
 * as well as batching operations through the underlying SQLite database connection.
 * The `_db` property provides access to the raw SQLite database instance
 * that can be used for executing custom queries or transactions.
 */
export interface GtfsSQLTables {
	_db: SQLiteDatabase['databaseInstance']
	calendar_dates: Record<string, OperationalDate[]>
	routes: SQLiteTableInstance<GtfsStrictV29Route>
	shapes: SQLiteTableInstance<GtfsStrictV29Shape>
	stop_times: SQLiteTableInstance<GtfsStrictV29StopTimes>
	stops: SQLiteTableInstance<GtfsStrictV29Stops>
	trips: SQLiteTableInstance<GtfsStrictV29Trips>
}
