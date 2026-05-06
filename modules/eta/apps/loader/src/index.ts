/* * */

import { insertEtaRides } from '@/clickhouse/insert-eta-rides.js';
import { insertHistoricalVehicleEvents } from '@/clickhouse/insert-historical-vehicle-events.js';
import { AppConfig } from '@/lib/config.js';
import { toEtaRideRow } from '@/rides/eta-ride-row.js';
import { buildRidesQuery, fetchCurrentWindowRides, fetchHistoricalRidesForDayIndex } from '@/rides/rides-query.js';
import { syncShapeNodes } from '@/shape-nodes/sync-shape-nodes.js';
import { GOClickHouseClient, queryEachStatementFromFile, queryFromFile } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

import { pipelinePath } from './lib/sql-paths.js';

/* * */

export async function main() {
	//
	// Initialize the logger

	Logger.init();
	const globalTimer = new Timer();
	const clickhouseClient = await GOClickHouseClient.getClient();

	const ridesQuery = buildRidesQuery();

	//
	// 0. Bootstrap

	if (AppConfig.pipelineSteps.runDdl || AppConfig.pipelineSteps.truncatePipelineTables) {
		Logger.title('0. Bootstrap');

		if (AppConfig.pipelineSteps.runDdl) {
			Logger.progress('Running 0a-ddl.sql');
			await queryEachStatementFromFile(clickhouseClient, pipelinePath('0a-ddl.sql'));
		}

		//
		// 0b. Truncate pipeline tables (destructive; clears staged data)

		if (AppConfig.pipelineSteps.truncatePipelineTables) {
			Logger.progress('Running 0b-truncate.sql');
			await queryEachStatementFromFile(clickhouseClient, pipelinePath('0b-truncate.sql'));
		}
	}

	//
	// 1. Insert current window rides into clickhouse

	if (AppConfig.pipelineSteps.insertCurrentWindowRides) {
		//

		Logger.title('1. Insert current window rides into clickhouse');

		const currentWindowRides = await fetchCurrentWindowRides(ridesQuery);
		await insertEtaRides(clickhouseClient, 'eta.curr_rides', currentWindowRides.map(toEtaRideRow), 'current window rides');
	}

	//
	// 2. Insert historical rides into clickhouse & get distinct hashed shape ids

	const disctictHashedShapeIds = new Set<string>();
	if (AppConfig.pipelineSteps.insertHistoricalRidesByDay) {
		//

		Logger.title('2. Insert historical rides into clickhouse');

		Logger.progress(`Getting historical rides for date range: ${Dates.now('Europe/Lisbon').minus({ days: AppConfig.historicalDataDaysBack }).iso} → ${Dates.now('Europe/Lisbon').iso}`);

		for (let index = 0; index < AppConfig.historicalDataDaysBack; index++) {
			//

			const historicalRides = await fetchHistoricalRidesForDayIndex(ridesQuery, index);

			historicalRides.forEach((ride) => {
				disctictHashedShapeIds.add(ride.hashed_shape_id);
			});

			Logger.progress(`Found ${historicalRides.length} historical rides`);

			// Insert into clickhouse, _id, trip_id, hashed_shape_id
			await insertEtaRides(clickhouseClient, 'eta.hist_rides', historicalRides.map(toEtaRideRow), 'historical rides');
		}
	}

	//
	// 3. Insert historical rides vehicle events into clickhouse

	if (AppConfig.pipelineSteps.insertHistoricalVehicleEvents) {
		await insertHistoricalVehicleEvents(clickhouseClient);
	}

	//
	// 4. Sync historical shape nodes into clickhouse

	if (AppConfig.pipelineSteps.insertHistoricalShapeNodes) {
		await syncShapeNodes(clickhouseClient, Array.from(disctictHashedShapeIds));
	}

	//
	// 5. Run Transformatino Pipeline

	if (AppConfig.pipelineSteps.runTransformationAndAggregationQueries) {
		//

		Logger.title('5. Run Node Travel Times Transformation & Aggregation');

		//
		Logger.progress(`Running 5a-build_hist_node_travel_times.sql query`);
		await queryFromFile(clickhouseClient, pipelinePath('2-build_hist_node_travel_times.sql'));

		//
		Logger.progress(`Running 5b-aggregate_hist_node_travel_times.sql query`);
		await queryFromFile(clickhouseClient, pipelinePath('3-aggregate_hist_node_travel_times.sql'));
	}

	//
	//

	Logger.success(`Loader completed in ${globalTimer.get()} seconds`);
}

/* * */

runOnInterval(main, { intervalMs: AppConfig.syncInterval });
