/* * */

import { files, plans } from '@go/interfaces';
import { mimeTypes } from '@go/consts';
import { Dates } from '@go/dates';
import { SQLiteDatabase, SQLiteDatabaseConfig } from '@go/utils-sqlite';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import fs from 'fs';
import cron from 'node-cron';
import os from 'os';

import { DrtJourneys, DrtPatternPoints, DrtPatterns, DrtPatternStops, DrtRoutes, DrtStops } from './drt.types.js';
import { importGtfsToDatabase, ImportGtfsToDatabaseConfig } from './import-gtfs-to-database.js';
import { DrtTables, parseGtfsToDrt } from './parse-gtfs-to-drt.js';

/* * */

const DAYS_TO_ADD = 3;

async function main() {
	try {
		//

		LOGGER.init();

		const globalTimer = new TIMETRACKER();

		//
		// Get all Plans and iterate on each one
		const startDate = Dates.now('Europe/Lisbon');
		const endDate = Dates.now('Europe/Lisbon').plus({ days: DAYS_TO_ADD });

		const filter = {
			'gtfs_feed_info.feed_end_date': { $gte: startDate.operational_date },
			'gtfs_feed_info.feed_start_date': { $lte: startDate.operational_date },
		};

		console.log(filter);

		const foundPlans = await plans.findMany(filter, { sort: { 'gtfs_feed_info.feed_start_date': -1 } });

		LOGGER.info(`Found ${foundPlans.length} Plans to process...`);

		if (foundPlans.length === 0) {
			LOGGER.info('No plans to process. Exiting...');
			return;
		}

		//
		// Insert All plans to the local SQLite database
		const importConfig: ImportGtfsToDatabaseConfig = {
			endDate: endDate.operational_date,
			startDate: startDate.operational_date,
		};

		//
		// Initialize the SQLite database
		const sqliteConfig: SQLiteDatabaseConfig = {
			instanceName: 'drt-model',
			instancePath: `${os.tmpdir()}/drt-model.db`,
		};
		const database = new SQLiteDatabase(sqliteConfig);
		const tables = intializeDrtSQLTables(database);

		//
		// Import the GTFS to the SQLite database and parse to DRT Database
		LOGGER.info(`[${globalTimer.get()}] Importing the GTFS to the SQLite database and parsing to DRT Database...`);
		for (const plan of foundPlans) {
			const sqlGtfs = await importGtfsToDatabase(plan, importConfig);
			await parseGtfsToDrt({ database: database, gtfs: sqlGtfs, plan: plan, tables: tables });
		}

		//
		// Save the SQLite database

		LOGGER.info(`[${globalTimer.get()}] Saving the SQLite database to the storage service...`);

		try {
			const fileStats = fs.statSync(sqliteConfig.instancePath);
			const fileStream = fs.createReadStream(sqliteConfig.instancePath);

			const fileResult = await files.upload(fileStream, {
				_id: 'drt-model',
				created_by: 'system	',
				name: 'drt-model.db',
				resource_id: 'Demand-Response-Transportation',
				scope: 'plans',
				size: fileStats.size,
				type: mimeTypes.sqlite,
				updated_by: 'system',
			}, { override: true });

			LOGGER.success(`SQLite database saved to the storage service.` + `(${fileResult._id})`, 0);
			LOGGER.divider();
		}
		catch (error) {
			LOGGER.error(`Error saving the SQLite database to the storage service.`, error);
			LOGGER.divider();
			process.exit(1);
		}

		//

		LOGGER.terminate(`Run took ${globalTimer.get()}`);

		//
	}
	catch (error) {
		LOGGER.error(error);
	}
}

/* * */

/* INITIALIZE SQL TABLES */
function intializeDrtSQLTables(database: SQLiteDatabase): DrtTables {
	//
	// Setup Tables

	const journeys = database.registerTable<DrtJourneys>('journeys', {
		batch_size: 10000,
		columns: [
			{ indexed: false, name: 'operator_id', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'operation_plan_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'date', not_null: true, type: 'TEXT' },
			{ indexed: true, name: 'journey_id', not_null: true, primary_key: true, type: 'INTEGER' },
			{ indexed: false, name: 'day_type_id', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'holiday', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'period', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'block_id', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'start_shift_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'end_shift_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'trip_headsign', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'trip_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'trip_short_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'start_stop_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'start_stop_sequence', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'start_departure_time', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'end_stop_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'end_stop_sequence', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'end_arrival_time', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'va_trip_number', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'da_trip_number', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'route_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_long_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_origin', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_destination', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_short_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_desc', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'line_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'line_short_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'line_long_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'direction_id', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'pattern_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'pattern_short_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'shape_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'journey_metric', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'run_type', not_null: true, type: 'TEXT' },

		],
	});

	const routes = database.registerTable<DrtRoutes>('routes', {
		batch_size: 10000,
		columns: [
			{ indexed: false, name: 'operator_id', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'operation_plan_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'line_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'line_short_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'line_long_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_origin', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_destination', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_short_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_long_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_url', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_color', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_text_color', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_sort_order', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'route_desc', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'pattern_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'variant_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'variant_description', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'direction_id', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'school', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'continuous_pickup', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'continuous_drop_off', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'sample_trip_id', not_null: true, type: 'TEXT' },
		],
	});

	const stops = database.registerTable<DrtStops>('stops', {
		batch_size: 10000,
		columns: [
			{ indexed: false, name: 'operator_id', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'operation_plan_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'stop_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'stop_code', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'stop_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'stop_desc', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'stop_lat', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'stop_lng', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'zone_shift', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'stop_url', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'location_type', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'parent_station', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'stop_timezone', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'wheelchair_boarding', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'platform_code', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'entrance_restriction', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'exit_restriction', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'slot', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'signalling', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'shelter', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'bench', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'network_map', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'schedule', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'real_time_information', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'tariff', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'preservation_state', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'equipment', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'observations', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'region', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'municipality', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'municipality_fare_1', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'municipality_fare_2', not_null: true, type: 'TEXT' },
		],
	});

	const patternPoints = database.registerTable<DrtPatternPoints>('pattern_points', {
		batch_size: 10000,
		columns: [
			{ indexed: false, name: 'operator_id', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'operation_plan_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'pattern_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'ordinal', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'stop_code', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'stop_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'lat', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'lng', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'is_stop', not_null: true, type: 'BOOLEAN' },
			{ indexed: false, name: 'is_waypoint', not_null: true, type: 'BOOLEAN' },
			{ indexed: false, name: 'meters_from_start', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'meters_to_end', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'meters_from_previous_stop', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'meters_to_next_stop', not_null: true, type: 'REAL' },
		],
	});

	const patternStops = database.registerTable<DrtPatternStops>('pattern_stops', {
		batch_size: 10000,
		columns: [
			{ indexed: false, name: 'operator_id', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'operation_plan_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'pattern_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'ordinal', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'stop_sequence', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'stop_headsign', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'fare_info', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'stop_code', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'stop_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'lat', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'lng', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'meters_from_start', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'meters_to_end', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'meters_from_previous_stop', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'meters_to_next_stop', not_null: true, type: 'REAL' },
		],
	});

	const patterns = database.registerTable<DrtPatterns>('patterns', {
		batch_size: 10000,
		columns: [
			{ indexed: false, name: 'operator_id', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'operation_plan_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'pattern_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'metric', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'start_stop_code', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'end_stop_code', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'serial_id', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'encoded_path', not_null: true, type: 'TEXT' },
		],
	});

	return {
		journeys,
		patternPoints,
		patterns,
		patternStops,
		routes,
		stops,
	};
}

/* * */

(async function init() {
	// Run at launch
	await main();

	// Run at 1 AM every day
	cron.schedule('0 1 * * *', async () => {
		await main();
	});
})();
