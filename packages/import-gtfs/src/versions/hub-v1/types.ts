/* * */

import { type SQLiteDatabase, type SQLiteTableInstance } from '@tmlmobilidade/go-clients-sqlite';
import { type HubV1GtfsRoutes, type HubV1GtfsShapes, type HubV1GtfsStops, type HubV1GtfsStopTimes, type HubV1GtfsTrips } from '@tmlmobilidade/go-types-hub';
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
export interface GtfsHubV1SQLTables {
	_db: SQLiteDatabase
	calendar_dates: Record<string, OperationalDateInt[]>
	routes: SQLiteTableInstance<HubV1GtfsRoutes>
	shapes: SQLiteTableInstance<HubV1GtfsShapes>
	stop_times: SQLiteTableInstance<HubV1GtfsStopTimes>
	stops: SQLiteTableInstance<HubV1GtfsStops>
	trips: SQLiteTableInstance<HubV1GtfsTrips>
}
