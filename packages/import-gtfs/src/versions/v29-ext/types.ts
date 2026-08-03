/* * */

import { type GtfsDate } from '@tmlmobilidade/go-types-gtfs';
import { type GtfsStrictV29ExtRoutes, type GtfsStrictV29ExtShapes, type GtfsStrictV29ExtStops, type GtfsStrictV29ExtStopTimes, type GtfsStrictV29ExtTrips } from '@tmlmobilidade/go-types-gtfs-strict';
import { SQLiteDatabase, type SQLiteTableInstance } from '@tmlmobilidade/sqlite';

/**
 * Holds references to all GTFS-related SQL tables.
 * Each property corresponds to a specific GTFS entity and is associated
 * with a `SQLiteTableInstance` instance for that entity. This structure
 * allows for organized access and manipulation of GTFS data within the database,
 * as well as batching operations through the underlying SQLite database connection.
 * The `_db` property provides access to the raw SQLite database instance
 * that can be used for executing custom queries or transactions.
 */
export interface GtfsStrictV29ExtSQLTables {
	_db: SQLiteDatabase['databaseInstance']
	calendar_dates: Record<string, GtfsDate[]>
	routes: SQLiteTableInstance<GtfsStrictV29ExtRoutes>
	shapes: SQLiteTableInstance<GtfsStrictV29ExtShapes>
	stop_times: SQLiteTableInstance<GtfsStrictV29ExtStopTimes>
	stops: SQLiteTableInstance<GtfsStrictV29ExtStops>
	trips: SQLiteTableInstance<GtfsStrictV29ExtTrips>
}
