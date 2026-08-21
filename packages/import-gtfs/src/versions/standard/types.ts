/* * */

import { type SQLiteDatabase, type SQLiteTableInstance } from '@tmlmobilidade/go-clients-sqlite';
import { type GtfsDate, type GtfsRoutes, type GtfsShapes, type GtfsStops, type GtfsStopTimes, type GtfsTrips } from '@tmlmobilidade/go-types-gtfs';

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
	_db: SQLiteDatabase
	calendar_dates: Record<string, GtfsDate[]>
	routes: SQLiteTableInstance<GtfsRoutes>
	shapes: SQLiteTableInstance<GtfsShapes>
	stop_times: SQLiteTableInstance<GtfsStopTimes>
	stops: SQLiteTableInstance<GtfsStops>
	trips: SQLiteTableInstance<GtfsTrips>
}
