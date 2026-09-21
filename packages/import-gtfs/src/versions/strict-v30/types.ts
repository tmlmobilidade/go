/* * */

import { type SQLiteDatabase, type SQLiteTableInstance } from '@tmlmobilidade/go-clients-sqlite';
import { type GtfsStrictV30Routes, type GtfsStrictV30Shapes, type GtfsStrictV30Stops, type GtfsStrictV30StopTimes, type GtfsStrictV30Trips } from '@tmlmobilidade/go-types-gtfs-strict';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';

/**
 * Holds references to all GTFS-related SQL tables.
 * Each property corresponds to a specific GTFS entity and is associated
 * with a `SQLiteTableInstance` instance for that entity. This structure
 * allows for organized access and manipulation of GTFS data within the database,
 * as well as batching operations through the underlying SQLite database connection.
 * The `_db` property provides access to the raw SQLite database instance
 * that can be used for executing custom queries or transactions.
 */
export interface GtfsStrictV30SQLTables {
	_db: SQLiteDatabase
	calendar_dates: Record<string, OperationalDateInt[]>
	routes: SQLiteTableInstance<GtfsStrictV30Routes>
	shapes: SQLiteTableInstance<GtfsStrictV30Shapes>
	stop_times: SQLiteTableInstance<GtfsStrictV30StopTimes>
	stops: SQLiteTableInstance<GtfsStrictV30Stops>
	trips: SQLiteTableInstance<GtfsStrictV30Trips>
}
