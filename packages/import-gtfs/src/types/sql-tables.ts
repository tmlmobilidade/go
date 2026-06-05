/* * */

import { type SQLiteDatabase, type SQLiteTableInstance } from '@tmlmobilidade/sqlite';
import { type GTFS_Route_Extended, type GTFS_Shape, type GTFS_Stop_Extended, type GTFS_StopTime, type GTFS_Trip_Extended } from '@tmlmobilidade/types';
import { type OperationalDate } from '@tmlmobilidade/types';

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
	routes: SQLiteTableInstance<GTFS_Route_Extended>
	shapes: SQLiteTableInstance<GTFS_Shape>
	stop_times: SQLiteTableInstance<GTFS_StopTime>
	stops: SQLiteTableInstance<GTFS_Stop_Extended>
	trips: SQLiteTableInstance<GTFS_Trip_Extended>
}
