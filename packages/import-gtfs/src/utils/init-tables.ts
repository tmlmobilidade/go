/* * */

import { type GtfsSQLTables } from '@/types/sql-tables.js';
import { SQLiteDatabase } from '@tmlmobilidade/sqlite';
import { type OperationalDate } from '@tmlmobilidade/types';
import { type GTFS_Route_Extended, type GTFS_Shape, type GTFS_Stop_Extended, type GTFS_StopTime, type GTFS_Trip_Extended } from '@tmlmobilidade/types';

/**
 * Initializes GTFS SQL tables and writers.
 * @returns The initialized GTFS SQL tables.
 */
export function initGtfsSqlTables(): GtfsSQLTables {
	//

	const calendarDatesMap: Record<string, OperationalDate[]> = {};

	const database = new SQLiteDatabase({ memory: false });

	const tripsTable = database.registerTable<GTFS_Trip_Extended>('trips', {
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
			{ indexed: false, name: 'trip_short_name', type: 'TEXT' },
			{ indexed: false, name: 'wheelchair_accessible', type: 'INTEGER' },
			{ indexed: false, name: 'pattern_id', not_null: true, type: 'TEXT' },
		],
	});

	const routesTable = database.registerTable<GTFS_Route_Extended>('routes', {
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
			{ indexed: false, name: 'route_sort_order', type: 'INTEGER' },
			{ indexed: false, name: 'route_text_color', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_type', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'route_url', type: 'TEXT' },
			{ indexed: false, name: 'circular', type: 'INTEGER' },
			{ indexed: false, name: 'line_id', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'line_long_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'line_short_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'path_type', type: 'INTEGER' },
			{ indexed: false, name: 'route_remarks', type: 'TEXT' },
			{ indexed: false, name: 'school', type: 'INTEGER' },
		],
	});

	const shapesTable = database.registerTable<GTFS_Shape>('shapes', {
		batch_size: 100000,
		columns: [
			{ indexed: true, name: 'shape_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'shape_pt_lat', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'shape_pt_lon', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'shape_pt_sequence', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'shape_dist_traveled', not_null: true, type: 'REAL' },
		],
	});

	const stopsTable = database.registerTable<GTFS_Stop_Extended>('stops', {
		batch_size: 10000,
		columns: [
			{ indexed: false, name: 'level_id', type: 'TEXT' },
			{ indexed: false, name: 'location_type', type: 'INTEGER' },
			{ indexed: false, name: 'parent_station', type: 'TEXT' },
			{ indexed: false, name: 'platform_code', type: 'TEXT' },
			{ indexed: false, name: 'stop_code', type: 'TEXT' },
			{ indexed: false, name: 'stop_desc', type: 'TEXT' },
			{ indexed: true, name: 'stop_id', not_null: true, primary_key: true, type: 'TEXT' },
			{ indexed: false, name: 'stop_lat', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'stop_lon', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'stop_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'stop_timezone', type: 'TEXT' },
			{ indexed: false, name: 'stop_url', type: 'TEXT' },
			{ indexed: false, name: 'wheelchair_boarding', type: 'INTEGER' },
			{ indexed: false, name: 'zone_id', type: 'TEXT' },
			{ indexed: false, name: 'has_bench', type: 'INTEGER' },
			{ indexed: false, name: 'has_network_map', type: 'INTEGER' },
			{ indexed: false, name: 'has_pip_real_time', type: 'INTEGER' },
			{ indexed: false, name: 'has_schedules', type: 'INTEGER' },
			{ indexed: false, name: 'has_shelter', type: 'INTEGER' },
			{ indexed: false, name: 'has_stop_sign', type: 'INTEGER' },
			{ indexed: false, name: 'has_tariffs_information', type: 'INTEGER' },
			{ indexed: false, name: 'municipality_id', type: 'TEXT' },
			{ indexed: false, name: 'parish_id', type: 'TEXT' },
			{ indexed: false, name: 'public_visible', type: 'INTEGER' },
			{ indexed: false, name: 'region_id', type: 'TEXT' },
			{ indexed: false, name: 'shelter_code', type: 'TEXT' },
			{ indexed: false, name: 'shelter_maintainer', type: 'TEXT' },
			{ indexed: false, name: 'stop_short_name', type: 'TEXT' },
			{ indexed: false, name: 'tts_stop_name', type: 'TEXT' },
		],
	});

	const stopTimesTable = database.registerTable<GTFS_StopTime>('stop_times', {
		batch_size: 100000,
		columns: [
			{ indexed: false, name: 'arrival_time', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'continuous_drop_off', type: 'INTEGER' },
			{ indexed: false, name: 'continuous_pickup', type: 'INTEGER' },
			{ indexed: false, name: 'departure_time', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'drop_off_type', type: 'INTEGER' },
			{ indexed: false, name: 'pickup_type', type: 'INTEGER' },
			{ indexed: false, name: 'shape_dist_traveled', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'stop_headsign', type: 'TEXT' },
			{ indexed: true, name: 'stop_id', not_null: true, type: 'TEXT' },
			{ indexed: true, name: 'trip_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'stop_sequence', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'timepoint', type: 'INTEGER' },
		],
	});

	return {
		_db: database.databaseInstance,
		calendar_dates: calendarDatesMap,
		routes: routesTable,
		shapes: shapesTable,
		stop_times: stopTimesTable,
		stops: stopsTable,
		trips: tripsTable,
	};

	//
}
