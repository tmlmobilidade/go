/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { performInTimeChunks, runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { sqlPath } from '@tmlmobilidade/go-utils-sql';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { AppConfig } from './config.js';
import { aggregateHistNodeTravelTimes } from './tasks/aggregate-hist-node-travel-times.js';
import { buildHistNodeTravelTimes } from './tasks/build-hist-node-travel-times.js';
import { loadHistoricalShapeNodes } from './tasks/load-historical-shape-nodes.js';

/* * */

//
// Initialize Sentry

try {
	await initSentryNode();
	Logger.startNodeLogs({ app: 'eta-loader', message: 'Sentry Hub ETA Loader initialized', module: 'hub', severity: 'info' });
} catch (error) {
	Logger.error({ error, message: 'Error initializing Sentry Hub ETA Loader' });
}

async function main() {
	//

	//
	// Initialize the logger

	Logger.init();
	const globalTimer = new Timer();

	//
	// 1. Bootstrap
	if (AppConfig.stages._1_bootstrap) {
		Logger.title('1. Bootstrapping ETA');

		await labDb.queryEachStatementFromFile(sqlPath('hub', 'eta/bootstrap/create-tables.sql'));
		Logger.progress({ message: 'Created base tables' });

		await labDb.queryEachStatementFromFile(sqlPath('hub', 'eta/bootstrap/mv-sync-curr-vehicle-events.sql'));
		Logger.progress({ message: 'Created MV: mv-sync-curr-vehicle-events' });

		await labDb.queryEachStatementFromFile(sqlPath('hub', 'eta/bootstrap/mv-predict-node-etas.sql'));
		Logger.progress({ message: 'Created MV: mv-predict-node-etas' });

		await labDb.queryEachStatementFromFile(sqlPath('hub', 'eta/bootstrap/mv-predict-trip-stop-etas.sql'));
		Logger.progress({ message: 'Created MV: mv-predict-trip-stop-etas' });
	}

	//
	// 2. Load current rides

	if (AppConfig.stages._2_loadCurrentRides) {
		Logger.title('2. Loading current rides');
		await labDb.queryFromFile(sqlPath('hub', 'eta/loader/load-rides.sql'), {
			agency_ids: AppConfig.agencyIds.join(','),
			line_ids: '',
			table_name: 'curr_rides',
			time_end: AppConfig.processing.currentRidesEndTime,
			time_start: AppConfig.processing.currentRidesStartTime,
		});

		Logger.progress({ message: 'Loaded current rides: curr_rides' });
	}

	//
	// 3. Load historical rides

	if (AppConfig.stages._3_loadHistoricalRides) {
		Logger.title('3. Loading historical rides');
		await labDb.queryFromFile(sqlPath('hub', 'eta/loader/load-rides.sql'), {
			agency_ids: AppConfig.agencyIds.join(','),
			line_ids: '',
			table_name: 'hist_rides',
			time_end: AppConfig.processing.historicalRidesEndTime,
			time_start: AppConfig.processing.historicalRidesStartTime,
		});

		// Delete where analysis_expected_vehicle_event_coverage_geo_grade != 'pass'
		await labDb.command({
			query: `DELETE FROM eta.hist_rides WHERE ifNull(analysis_expected_vehicle_event_coverage_geo_grade, '') != 'pass'`,
		});

		Logger.progress({ message: 'Loaded historical rides: hist_rides' });
	}

	//
	// 4. Load historical shape nodes
	if (AppConfig.stages._4_loadHistoricalShapeNodes) {
		Logger.title('4. Loading historical shape nodes');
		await loadHistoricalShapeNodes(AppConfig.processing.shapeNodeChunkLength, AppConfig.processing.geohashPrefixLength);
		Logger.progress({ message: 'Loaded historical shape nodes: hist_shape_nodes' });
	}

	//
	// 5. Load historical vehicle events

	if (AppConfig.stages._5_loadHistoricalVehicleEvents) {
		Logger.title('5. Loading historical vehicle events');
		await performInTimeChunks({
			endDate: AppConfig.processing.historicalRidesEndTime,
			intervalHrs: 24,
			onChunk: async (chunk) => {
				Logger.progress({ message: `[${chunk.index + 1}/${chunk.total}] historical vehicle events` });
				await labDb.queryFromFile(sqlPath('hub', 'eta/loader/load-historical-vehicle-events.sql'), {
					chunk_end: chunk.end,
					chunk_start: chunk.start,
				});
			},
			order: 'desc',
			startDate: AppConfig.processing.historicalRidesStartTime,
		});
	}

	if (AppConfig.stages._6_calculateNodeTravelTimes) {
		Logger.title('6. Run Node Travel Times Transformation & Aggregation');

		//
		// Calculate the node travel times for the historical rides
		Logger.info({ message: 'Running build_hist_node_travel_times.sql query in chunks' });
		await buildHistNodeTravelTimes(AppConfig.processing.historicalRidesStartTime, AppConfig.processing.historicalRidesEndTime);

		//
		// Aggregate the node travel times for the historical rides
		Logger.info({ message: 'Running aggregate_hist_node_travel_times.sql query in chunks' });
		await aggregateHistNodeTravelTimes(AppConfig.processing.historicalRidesStartTime, AppConfig.processing.historicalRidesEndTime);
	}

	if (AppConfig.stages._7_loadCurrentWaypoints) {
		Logger.title('7. Loading and snapping current waypoints');

		await labDb.queryFromFile(sqlPath('hub', 'eta/loader/load-current-waypoints.sql'));
		Logger.progress({ message: 'Loaded current waypoints: curr_waypoints' });

		await labDb.queryFromFile(sqlPath('hub', 'eta/loader/snap-waypoints.sql'));
		Logger.progress({ message: 'Snapped waypoints: curr_waypoints_snapped' });
	}

	Logger.success(`ETA loaded in ${globalTimer.get()}.`);
}

/* * */

await runOnInterval(main, { intervalMs: AppConfig.syncInterval });
