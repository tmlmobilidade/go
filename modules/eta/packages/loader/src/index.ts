/* * */

import { insertEtaRides } from '@/clickhouse/insert-eta-rides.js';
import { insertHistoricalVehicleEvents } from '@/clickhouse/insert-historical-vehicle-events.js';
import { AppConfig } from '@/lib/config.js';
import { parseHistoricalRide, parseRide } from '@/lib/eta-ride-row.js';
import { buildHistNodeTravelTimes } from '@/process/build-hist-node-travel-times.js';
import { detectRideStartEndEvents } from '@/process/detect-ride-start-end-events.js';
import { buildRidesQuery, fetchCurrentWindowRides, fetchHistoricalRidesForDayIndex } from '@/process/rides-query.js';
import { syncShapeNodes } from '@/process/sync-shape-nodes.js';
import { GOClickHouseClient } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { pipelinePath, qualifiedTable, queryEachEtaStatementFromFile, queryEtaFromFile } from '@tmlmobilidade/go-eta-pckg-common';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { syncCurrentWaypoints } from './process/sync-curr-waypoints.js';

/* * */

export async function loadEta(config: AppConfig) {
	//
	// Initialize the logger

	Logger.init();
	const globalTimer = new Timer();
	const clickhouseClient = await GOClickHouseClient.getClient();

	const ridesQuery = buildRidesQuery(config);

	//
	// 0. Bootstrap

	if (config.pipelineSteps.runDdl || config.pipelineSteps.truncatePipelineTables) {
		Logger.title('0. Bootstrap');

		//
		// Truncate pipeline tables (destructive; deletes tables from database)

		if (config.pipelineSteps.truncatePipelineTables) {
			Logger.info({ message: 'Running 0b-truncate.sql' });
			await queryEachEtaStatementFromFile(clickhouseClient, config.database, pipelinePath('bootstrap/0b-truncate.sql'));
		}

		//
		// Create tables

		if (config.pipelineSteps.runDdl) {
			Logger.info({ message: 'Running 0a-ddl.sql' });
			await queryEachEtaStatementFromFile(clickhouseClient, config.database, pipelinePath('bootstrap/0a-create-tables.sql'));

			Logger.info({ message: 'Creating Materialized Views' });

			await queryEachEtaStatementFromFile(clickhouseClient, config.database, pipelinePath('bootstrap/mv-sync-curr-vehicle-events.sql'));
			Logger.progress({ message: 'Created mv-sync-curr-vehicle-events' });

			await queryEachEtaStatementFromFile(clickhouseClient, config.database, pipelinePath('bootstrap/mv-predict-node-etas.sql'));
			Logger.progress({ message: 'Created mv-predict-node-etas' });

			await queryEachEtaStatementFromFile(clickhouseClient, config.database, pipelinePath('bootstrap/mv-predict-trip-stop-etas.sql'));
			Logger.progress({ message: 'Created mv-predict-trip-stop-etas' });
		}
	}

	//
	// 1. Insert current window rides into clickhouse

	const currentWindowDistinctHashedTrips = new Set<string>();
	if (config.pipelineSteps.insertCurrentWindowRides) {
		//

		Logger.title('1. Insert current window rides into clickhouse');

		const currentWindowRides = await fetchCurrentWindowRides(ridesQuery, config);
		await insertEtaRides(clickhouseClient, qualifiedTable(config.database, 'curr_rides'), currentWindowRides.map(parseRide), 'current window rides');

		// Get distinct hashed trip ids for later use
		currentWindowRides.forEach(ride => currentWindowDistinctHashedTrips.add(ride.hashed_trip_id));
	}

	//
	// 2. Insert historical rides into clickhouse & get distinct hashed shape ids

	const disctictHashedShapeIds = new Set<string>();
	if (config.pipelineSteps.insertHistoricalRidesByDay) {
		//

		Logger.title('2. Insert historical rides into clickhouse');

		Logger.info({ message: `Getting historical rides for date range: ${Dates.now('Europe/Lisbon').minus({ days: config.historicalDataDaysBack }).iso} → ${Dates.now('Europe/Lisbon').iso}` });

		const historicalRidesPromises = [];
		for (let index = 0; index < config.historicalDataDaysBack; index++) {
			historicalRidesPromises.push(
				(async () => {
					//

					// Fetch the historical rides for the day index.
					const historicalRides = await fetchHistoricalRidesForDayIndex(ridesQuery, index, config);

					// Add the distinct hashed shape ids to the set.
					historicalRides.forEach((ride) => {
						disctictHashedShapeIds.add(ride.hashed_shape_id);
					});

					Logger.info({ message: `Found ${historicalRides.length} historical rides` });

					// Insert into clickhouse, _id, trip_id, hashed_shape_id
					await insertEtaRides(clickhouseClient, qualifiedTable(config.database, 'hist_rides'), historicalRides.map(parseHistoricalRide), 'historical rides');
				})(),
			);
		}
		await Promise.all(historicalRidesPromises);
	}

	// process.exit(0);

	//
	// 2b. Detect historical ride start/end observed times in clickhouse
	//     Must run before step 3, which scopes source vehicle events by these times.

	if (config.pipelineSteps.detectRideStartEndEvents) {
		await detectRideStartEndEvents(clickhouseClient, config);
	}

	//
	// 3. Insert historical rides vehicle events into clickhouse

	if (config.pipelineSteps.insertHistoricalVehicleEvents) {
		await insertHistoricalVehicleEvents(clickhouseClient, config);
	}

	//
	// 4. Sync historical shape nodes into clickhouse

	if (config.pipelineSteps.insertHistoricalShapeNodes) {
		await syncShapeNodes(clickhouseClient, Array.from(disctictHashedShapeIds), config);
	}

	//
	// 5. Run Transformatino Pipeline

	if (config.pipelineSteps.runTransformationAndAggregationQueries) {
		//

		Logger.title('5. Run Node Travel Times Transformation & Aggregation');

		const historicalWindowEnd = Dates.now('Europe/Lisbon').unix_timestamp;
		const historicalWindowStart = Dates.now('Europe/Lisbon').minus({ days: config.historicalDataDaysBack }).unix_timestamp;

		//
		Logger.info({ message: 'Running 5a-build_hist_node_travel_times.sql query in chunks' });
		await buildHistNodeTravelTimes(clickhouseClient, historicalWindowStart, config);

		//
		Logger.info({ message: 'Running 5b-aggregate_hist_node_travel_times.sql query' });
		await queryEtaFromFile(clickhouseClient, config.database, pipelinePath('loader/3-aggregate_hist_node_travel_times.sql'), {
			window_end: historicalWindowEnd,
			window_start: historicalWindowStart,
		});
	}

	//
	// 6. Insert current window waypoints into clickhouse

	if (config.pipelineSteps.insertCurrentWindowWaypoints) {
		await syncCurrentWaypoints(clickhouseClient, Array.from(currentWindowDistinctHashedTrips), config);

		Logger.info({ message: 'Snapping waypoints for current window' });
		await queryEtaFromFile(clickhouseClient, config.database, pipelinePath('loader/4-snap-waypoints.sql'));
	}

	//
	//

	Logger.success(`Loader completed in ${globalTimer.get()} seconds`);
}
