/* * */

import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import { Timer } from '@tmlmobilidade/timer';

import { getAppConfig, SYNC_INTERVAL } from './config.js';
import { aggregateHistNodeTravelTimes } from './tasks/aggregate-hist-node-travel-times.js';
import { bootstrap } from './tasks/bootstrap.js';
import { buildHistNodeTravelTimes } from './tasks/build-hist-node-travel-times.js';
import { cleanup } from './tasks/cleanup.js';
import { loadCurrentWaypoints } from './tasks/load-current-waypoints.js';
import { loadHistoricalShapeNodes } from './tasks/load-historical-shape-nodes.js';
import { loadHistoricalVehicleEvents } from './tasks/load-historical-vehicle-events.js';
import { loadRides } from './tasks/load-rides.js';
import { refreshNodePredictions } from './tasks/refresh-node-predictions.js';

/* * */

/**
 * Loads the ETA data into ClickHouse and ages out what left the windows.
 *
 * Every stage is incremental: rides, shapes and events already present are not
 * re-inserted, and node travel times are (re)built only for the UTC days that
 * need it (the newest two, plus any day still missing inside the window).
 * A run on a warm database therefore touches one or two days of data. The
 * cleanup stage at the end uses the very same windows, so the two can never
 * disagree about what is in scope.
 */
async function main() {
	//

	//
	// Initialize the logger and build the config for this run,
	// so the time windows move with every cycle.

	Logger.init();

	const globalTimer = new Timer();

	const config = await getAppConfig();
	const { agencyIds, processing, stages } = config;

	//
	// 1. Bootstrap

	if (stages._1_bootstrap) {
		Logger.title('1. Bootstrapping ETA');
		await bootstrap();
	}

	//
	// 2. Load current rides

	if (stages._2_loadCurrentRides) {
		Logger.title('2. Loading current rides');
		await loadRides({
			agencyIds,
			requirePass: false,
			skipExisting: false,
			tableName: 'curr_rides',
			windowEnd: processing.currentRidesEndTime,
			windowStart: processing.currentRidesStartTime,
		});
	}

	//
	// 3. Load historical rides

	if (stages._3_loadHistoricalRides) {
		Logger.title('3. Loading historical rides');
		await loadRides({
			agencyIds,
			requirePass: true,
			skipExisting: true,
			tableName: 'hist_rides',
			windowEnd: processing.historicalRidesEndTime,
			windowStart: processing.historicalRidesStartTime,
		});
	}

	//
	// 4. Load historical shape nodes

	if (stages._4_loadHistoricalShapeNodes) {
		Logger.title('4. Loading historical shape nodes');
		await loadHistoricalShapeNodes(processing.shapeNodeChunkLength, processing.geohashPrefixLength);
	}

	//
	// 5. Load historical vehicle events

	if (stages._5_loadHistoricalVehicleEvents) {
		Logger.title('5. Loading historical vehicle events');
		await loadHistoricalVehicleEvents(processing.historicalRidesStartTime, processing.historicalRidesEndTime);
	}

	//
	// 6. Node travel times: build (per UTC day, partition replaced), aggregate
	//    only the operational days those partitions can affect, then push the
	//    fresh aggregates into the prediction view.

	if (stages._6_calculateNodeTravelTimes) {
		Logger.title('6. Calculating node travel times');

		const rebuiltChunks = await buildHistNodeTravelTimes(processing.historicalRidesStartTime, processing.historicalRidesEndTime);

		Logger.info({ message: `Aggregating hist_node_travel_times for ${rebuiltChunks.length} rebuilt day(s)` });
		await aggregateHistNodeTravelTimes(rebuiltChunks);

		if (rebuiltChunks.length > 0) {
			await refreshNodePredictions();
		}
	}

	//
	// 7. Load current waypoints

	if (stages._7_loadCurrentWaypoints) {
		Logger.title('7. Loading and snapping current waypoints');
		await loadCurrentWaypoints();
	}

	//
	// 8. Cleanup: age every table out of the windows used above.

	if (stages._8_cleanup) {
		Logger.title('8. Cleaning up out-of-window data');
		await cleanup(processing.currentRidesStartTime, processing.historicalRidesStartTime);
	}

	//
	// Log the total time taken for all stages

	Logger.terminate(`ETA loaded in ${globalTimer.get()}.`);

	//
}

/* * */

await runOnInterval(main, { intervalMs: SYNC_INTERVAL });
