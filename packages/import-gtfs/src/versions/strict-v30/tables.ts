/* * */

import { SQLiteDatabase } from '@tmlmobilidade/go-clients-sqlite';
import { type GtfsStrictV30Routes, type GtfsStrictV30Shapes, type GtfsStrictV30Stops, type GtfsStrictV30StopTimes, type GtfsStrictV30Trips } from '@tmlmobilidade/go-types-gtfs-strict';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';

import { type GtfsStrictV30SQLTables } from './types.js';

/**
 * Initializes GTFS Strict v30 SQL tables and writers.
 * @returns The initialized GTFS Strict v30 SQL tables.
 */
export function initGtfsStrictV30SqlTables(): GtfsStrictV30SQLTables {
	//

	const calendarDatesMap: Record<string, OperationalDateInt[]> = {};

	const database = new SQLiteDatabase();

	const tripsTable = database.registerTable<GtfsStrictV30Trips>('trips', {
		batch_size: 10000,
		columns: [
			{ indexed: false, name: 'bikes_allowed', type: 'TEXT' },
			{ indexed: false, name: 'block_id', type: 'TEXT' },
			{ indexed: false, name: 'direction_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'service_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'shape_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'trip_headsign', not_null: true, type: 'TEXT' },
			{ indexed: true, name: 'trip_id', not_null: true, primary_key: true, type: 'TEXT' },
			{ indexed: false, name: 'wheelchair_accessible', type: 'TEXT' },
		],
	});

	const routesTable = database.registerTable<GtfsStrictV30Routes>('routes', {
		batch_size: 10000,
		columns: [
			{ indexed: false, name: 'agency_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'cemv_support', type: 'TEXT' },
			{ indexed: false, name: 'continuous_drop_off', type: 'TEXT' },
			{ indexed: false, name: 'continuous_pickup', type: 'TEXT' },
			{ indexed: false, name: 'route_color', not_null: true, type: 'TEXT' },
			{ indexed: true, name: 'route_id', not_null: true, primary_key: true, type: 'TEXT' },
			{ indexed: false, name: 'route_long_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_short_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_sort_order', type: 'INTEGER' },
			{ indexed: false, name: 'route_text_color', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_type', not_null: true, type: 'TEXT' },
		],
	});

	const shapesTable = database.registerTable<GtfsStrictV30Shapes>('shapes', {
		batch_size: 100000,
		columns: [
			{ indexed: false, name: 'shape_dist_traveled', not_null: true, type: 'REAL' },
			{ indexed: true, name: 'shape_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'shape_pt_lat', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'shape_pt_lon', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'shape_pt_sequence', not_null: true, type: 'INTEGER' },
		],
	});

	const stopsTable = database.registerTable<GtfsStrictV30Stops>('stops', {
		batch_size: 10000,
		columns: [
			{ indexed: false, name: 'level_id', type: 'TEXT' },
			{ indexed: false, name: 'location_type', type: 'TEXT' },
			{ indexed: false, name: 'parent_station', type: 'TEXT' },
			{ indexed: false, name: 'platform_code', type: 'TEXT' },
			{ indexed: false, name: 'stop_code', type: 'TEXT' },
			{ indexed: true, name: 'stop_id', not_null: true, primary_key: true, type: 'TEXT' },
			{ indexed: false, name: 'stop_lat', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'stop_lon', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'stop_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'wheelchair_boarding', type: 'TEXT' },
		],
	});

	const stopTimesTable = database.registerTable<GtfsStrictV30StopTimes>('stop_times', {
		batch_size: 100000,
		columns: [
			{ indexed: false, name: 'arrival_time', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'departure_time', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'drop_off_type', type: 'TEXT' },
			{ indexed: false, name: 'pickup_type', type: 'TEXT' },
			{ indexed: false, name: 'shape_dist_traveled', not_null: true, type: 'REAL' },
			{ indexed: true, name: 'stop_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'stop_sequence', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'timepoint', type: 'TEXT' },
			{ indexed: true, name: 'trip_id', not_null: true, type: 'TEXT' },
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
