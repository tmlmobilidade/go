/* * */

import { insertEtaRides } from '@/clickhouse/insert-eta-rides.js';
import { insertHistoricalVehicleEvents } from '@/clickhouse/insert-historical-vehicle-events.js';
import { type AppConfig } from '@/lib/config.js';
import { parseHistoricalRide, parseRide } from '@/lib/eta-ride-row.js';
import { buildHistNodeTravelTimes } from '@/process/build-hist-node-travel-times.js';
import { detectRideStartEndEvents } from '@/process/detect-ride-start-end-events.js';
import { buildRidesQuery, fetchCurrentWindowRides, fetchHistoricalRidesForDayIndex } from '@/process/rides-query.js';
import { syncShapeNodes } from '@/process/sync-shape-nodes.js';
import { Dates } from '@tmlmobilidade/dates';
import { pipelinePath, qualifiedTable, queryEachEtaStatementFromFile, queryEtaFromFile } from '@tmlmobilidade/go-eta-pckg-common';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { Logger } from '@tmlmobilidade/logger-logger-backend';
import { Timer } from '@tmlmobilidade/timer';

import { syncCurrentWaypoints } from './process/sync-curr-waypoints.js';

/* * */

export async function loadEta(config: AppConfig) {
	//
	// Initialize the logger

	Logger.init();
	const globalTimer = new Timer();
	const clickhouseClient = await labDb.getClient();

	const ridesQuery = buildRidesQuery(config);

	//
	// 0. Bootstrap

	if (config.pipelineSteps.runDdl || config.pipelineSteps.truncatePipelineTables) {
		Logger.title('0. Bootstrap');

		//
		// Truncate pipeline tables (destructive; deletes tables from database)

		if (config.pipelineSteps.truncatePipelineTables) {
			Logger.info({ message: 'Running 0b-truncate.sql' });
			await queryEachEtaStatementFromFile(clickhouseClient, pipelinePath('bootstrap/0b-truncate.sql'));
		}

		//
		// Create tables

		if (config.pipelineSteps.runDdl) {
			Logger.info({ message: 'Running 0a-ddl.sql' });
			await queryEachEtaStatementFromFile(clickhouseClient, pipelinePath('bootstrap/0a-create-tables.sql'));

			Logger.info({ message: 'Creating Materialized Views' });

			await queryEachEtaStatementFromFile(clickhouseClient, pipelinePath('bootstrap/mv-sync-curr-vehicle-events.sql'));
			Logger.progress({ message: 'Created mv-sync-curr-vehicle-events' });

			await queryEachEtaStatementFromFile(clickhouseClient, pipelinePath('bootstrap/mv-predict-node-etas.sql'));
			Logger.progress({ message: 'Created mv-predict-node-etas' });

			await queryEachEtaStatementFromFile(clickhouseClient, pipelinePath('bootstrap/mv-predict-trip-stop-etas.sql'));
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
		await insertEtaRides(clickhouseClient, qualifiedTable('eta', 'curr_rides'), currentWindowRides.map(parseRide), 'current window rides');

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
					await insertEtaRides(clickhouseClient, qualifiedTable('eta', 'hist_rides'), historicalRides.map(parseHistoricalRide), 'historical rides');
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

		const historicalWindowStart = Dates.now('Europe/Lisbon').minus({ days: config.historicalDataDaysBack }).unix_timestamp;

		//
		Logger.info({ message: 'Running 5a-build_hist_node_travel_times.sql query in chunks' });
		await buildHistNodeTravelTimes(clickhouseClient, historicalWindowStart, config);

		//
		// Aggregate one operational day per query so GROUP BY state stays bounded
		// (aggregating the whole window at once exceeded the query memory limit).
		Logger.info({ message: 'Running 5b-aggregate_hist_node_travel_times.sql query per operational day' });
		const hourMs = 3_600_000;
		for (let dayIndex = 0; dayIndex <= config.historicalDataDaysBack; dayIndex++) {
			const day = Dates.now('Europe/Lisbon').minus({ days: dayIndex }).startOf('day');
			Logger.progress({ message: `[${dayIndex + 1}/${config.historicalDataDaysBack + 1}] 5b operational day ${day.toFormat('yyyyMMdd')}` });
			// Rows of an operational day have created_at within [00:00, next day 04:00)
			// in the ClickHouse SERVER timezone; the ±padding below covers any server
			// timezone offset. Exact row selection happens in SQL via operational_date.
			await queryEtaFromFile(clickhouseClient, pipelinePath('loader/3-aggregate_hist_node_travel_times.sql'), {
				chunk_date: Number(day.toFormat('yyyyMMdd')),
				scan_end: day.unix_timestamp + 42 * hourMs,
				scan_start: day.unix_timestamp - 16 * hourMs,
			});
		}
	}

	//
	// 6. Insert current window waypoints into clickhouse

	if (config.pipelineSteps.insertCurrentWindowWaypoints) {
		await syncCurrentWaypoints(clickhouseClient, Array.from(currentWindowDistinctHashedTrips), config);

		Logger.info({ message: 'Snapping waypoints for current window' });
		await queryEtaFromFile(clickhouseClient, pipelinePath('loader/4-snap-waypoints.sql'));
	}

	//
	//

	Logger.success(`Loader completed in ${globalTimer.get()} seconds`);
}
