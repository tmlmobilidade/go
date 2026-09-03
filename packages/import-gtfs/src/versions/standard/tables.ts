/* * */

import { SQLiteDatabase, type SQLiteDatabaseConfig } from '@tmlmobilidade/go-clients-sqlite';
import { type GtfsRoutes, type GtfsShapes, type GtfsStops, type GtfsStopTimes, type GtfsTrips } from '@tmlmobilidade/go-types-gtfs';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';

import { type GtfsSQLTables } from './types.js';

/**
 * Initializes GTFS Strict v29 SQL tables and writers.
 * @returns The initialized GTFS SQL tables.
 */
export function initGtfsSqlTables(sqliteConfig?: SQLiteDatabaseConfig): GtfsSQLTables {
	//

	const calendarDatesMap: Record<string, OperationalDateInt[]> = {};

	const database = new SQLiteDatabase(sqliteConfig);

	const tripsTable = database.registerTable<GtfsTrips>('trips', {
		batch_size: 10000,
		columns: [
			{ indexed: true, name: 'trip_id', not_null: true, primary_key: true, type: 'TEXT' },
			{ indexed: false, name: 'bikes_allowed', type: 'INTEGER' },
			{ indexed: false, name: 'block_id', type: 'TEXT' },
			{ indexed: false, name: 'direction_id', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'route_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'service_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'shape_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'trip_headsign', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'wheelchair_accessible', type: 'INTEGER' },
		],
	});

	const routesTable = database.registerTable<GtfsRoutes>('routes', {
		batch_size: 10000,
		columns: [
			{ indexed: false, name: 'agency_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'continuous_drop_off', type: 'INTEGER' },
			{ indexed: false, name: 'continuous_pickup', type: 'INTEGER' },
			{ indexed: false, name: 'route_color', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_desc', type: 'TEXT' },
			{ indexed: true, name: 'route_id', not_null: true, primary_key: true, type: 'TEXT' },
			{ indexed: false, name: 'route_long_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_short_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_text_color', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_type', not_null: true, type: 'INTEGER' },
		],
	});

	const shapesTable = database.registerTable<GtfsShapes>('shapes', {
		batch_size: 100000,
		columns: [
			{ indexed: true, name: 'shape_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'shape_pt_lat', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'shape_pt_lon', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'shape_pt_sequence', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'shape_dist_traveled', not_null: true, type: 'REAL' },
		],
	});

	const stopsTable = database.registerTable<GtfsStops>('stops', {
		batch_size: 10000,
		columns: [
			{ indexed: false, name: 'location_type', type: 'INTEGER' },
			{ indexed: false, name: 'parent_station', type: 'TEXT' },
			{ indexed: false, name: 'platform_code', type: 'TEXT' },
			{ indexed: false, name: 'stop_code', type: 'TEXT' },
			{ indexed: true, name: 'stop_id', not_null: true, primary_key: true, type: 'TEXT' },
			{ indexed: false, name: 'stop_lat', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'stop_lon', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'stop_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'wheelchair_boarding', type: 'INTEGER' },
			// { indexed: false, name: 'lifecycle_status', type: 'TEXT' },
			// { indexed: false, name: 'stop_short_name', type: 'TEXT' },
			// { indexed: false, name: 'tts_stop_name', type: 'TEXT' },
			// { indexed: false, name: 'district_id', type: 'TEXT' },
			// { indexed: false, name: 'district_name', type: 'TEXT' },
			// { indexed: false, name: 'flags', type: 'TEXT' },
			// { indexed: false, name: 'legacy_ids', type: 'TEXT' },
			// { indexed: false, name: 'municipality_id', type: 'TEXT' },
			// { indexed: false, name: 'municipality_name', type: 'TEXT' },
			// { indexed: false, name: 'parish_id', type: 'TEXT' },
			// { indexed: false, name: 'parish_name', type: 'TEXT' },
			// { indexed: false, name: 'locality_id', type: 'TEXT' },
			// { indexed: false, name: 'locality_name', type: 'TEXT' },
		],
	});

	const stopTimesTable = database.registerTable<GtfsStopTimes>('stop_times', {
		batch_size: 100000,
		columns: [
			{ indexed: false, name: 'arrival_time', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'departure_time', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'drop_off_type', type: 'TEXT' },
			{ indexed: false, name: 'pickup_type', type: 'TEXT' },
			{ indexed: false, name: 'shape_dist_traveled', not_null: true, type: 'REAL' },
			{ indexed: true, name: 'stop_id', not_null: true, type: 'TEXT' },
			{ indexed: true, name: 'trip_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'stop_sequence', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'timepoint', type: 'TEXT' },
		],
	});

	return {
		_db: database,
		calendar_dates: calendarDatesMap,
		routes: routesTable,
		shapes: shapesTable,
		stop_times: stopTimesTable,
		stops: stopsTable,
		trips: tripsTable,
	};
}
