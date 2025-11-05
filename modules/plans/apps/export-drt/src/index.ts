/* * */

import { Dates } from '@go/dates';
import { SQLiteDatabase, SQLiteDatabaseConfig } from '@go/utils-sqlite';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { DrtAgency, DrtHashedShape, DrtHashedTrip, DrtRide, DrtStop, DrtTables, GlobalContext } from './drt.types.js';
import { processor } from './processor.js';

/* * */

const DAYS_TO_ADD = 3;
const RUN_INTERVAL = 10 * 60 * 60_000; // 10 hours in milliseconds

export const GLOBAL_CONTEXT: GlobalContext = {
	configs: {
		database_name: 'drt-model',
		database_path: os.tmpdir(),
		end_date: Dates.now('Europe/Lisbon').plus({ days: DAYS_TO_ADD }).unix_timestamp,
		start_date: Dates.now('Europe/Lisbon').unix_timestamp,
	},
	database: undefined,
	tables: undefined,
};

/* * */
/* INITIALIZE SQL TABLES */
function intializeDrtSQLTables(database: SQLiteDatabase): DrtTables {
	//
	// Setup Tables

	const agencies = database.registerTable<DrtAgency>('agencies', {
		batch_size: 10000,
		columns: [
			{ indexed: true, name: '_id', not_null: true, primary_key: true, type: 'TEXT' },
			{ indexed: false, name: 'agency_name', not_null: true, type: 'TEXT' },

		],
	});

	const shapes = database.registerTable<DrtHashedShape>('shapes', {
		batch_size: 10000,
		columns: [
			{ indexed: true, name: '_id', not_null: true, primary_key: true, type: 'TEXT' },
			{ indexed: false, name: 'hashed_shape_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'meters_from_previous_stop', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'meters_from_start', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'meters_to_end', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'meters_to_next_stop', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'shape_dist_traveled', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'shape_pt_lat', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'shape_pt_lon', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'shape_pt_sequence', not_null: true, type: 'INTEGER' },
		],
	});

	const stops = database.registerTable<DrtStop>('stops', {
		batch_size: 10000,
		columns: [
			{ indexed: true, name: '_id', not_null: true, primary_key: true, type: 'TEXT' },
			{ indexed: false, name: 'stop_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'tts_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'longitude', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'latitude', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'district_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'locality_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'municipality_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'parish_id', not_null: true, type: 'TEXT' },
		],
	});

	const hashed_trips = database.registerTable<DrtHashedTrip>('hashed_trips', {
		batch_size: 10000,
		columns: [
			{ indexed: true, name: '_id', not_null: true, primary_key: true, type: 'TEXT' },
			{ indexed: false, name: 'hashed_trip_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'stop_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'stop_sequence', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'shape_dist_traveled', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'arrival_time', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'departure_time', not_null: true, type: 'TEXT' },
		],
	});

	const rides = database.registerTable<DrtRide>('rides', {
		batch_size: 10000,
		columns: [
			{ indexed: true, name: '_id', not_null: true, primary_key: true, type: 'TEXT' },
			{ indexed: false, name: 'hashed_trip_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'trip_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'plan_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'pattern_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'headsign', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'operational_date', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'start_time_scheduled', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'end_time_scheduled', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'extension_scheduled', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'driver_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'vehicle_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'da_trip_number', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'va_trip_number', not_null: true, type: 'INTEGER' },
		],
	});

	return {
		agencies,
		hashed_trips,
		rides,
		shapes,
		stops,
	};
}

/* * */
/* MAIN FUNCTION */
async function main() {
	try {
		//

		LOGGER.init();
		const globalTimer = new TIMETRACKER();

		//
		// Delete the database if it exists
		if (fs.existsSync(path.join(GLOBAL_CONTEXT.configs.database_path, `${GLOBAL_CONTEXT.configs.database_name}.db`))) {
			fs.unlinkSync(path.join(GLOBAL_CONTEXT.configs.database_path, `${GLOBAL_CONTEXT.configs.database_name}.db`));
		}

		//
		// Initialize the SQLite database
		const sqliteConfig: SQLiteDatabaseConfig = {
			instanceName: GLOBAL_CONTEXT.configs.database_name,
			instancePath: path.join(GLOBAL_CONTEXT.configs.database_path, `${GLOBAL_CONTEXT.configs.database_name}.db`),
		};

		GLOBAL_CONTEXT.database = new SQLiteDatabase(sqliteConfig);
		GLOBAL_CONTEXT.tables = intializeDrtSQLTables(GLOBAL_CONTEXT.database);

		//
		// Process the rides
		LOGGER.title(`Processing the DRT data`);
		await processor();

		LOGGER.success(GLOBAL_CONTEXT.configs.database_path);

		LOGGER.terminate(`Finished processing the DRT data in ${globalTimer.get()}.`);
		LOGGER.divider();

		//
		// Exit the application
		process.exit(0);
	}
	catch (error) {
		LOGGER.error('Error parsing plan.', error);
		throw error;
	}
}

/* * */

(async function init() {
	const runOnInterval = async () => {
		await main();
		setTimeout(runOnInterval, RUN_INTERVAL);
	};
	runOnInterval();
})();
