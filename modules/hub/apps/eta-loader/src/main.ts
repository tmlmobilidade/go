/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { sqlPath } from '@tmlmobilidade/go-utils-sql';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { aggregateHistNodeTravelTimes } from './process/aggregate-hist-node-travel-times.js';
import { buildHistNodeTravelTimes } from './process/build-hist-node-travel-times.js';
import { utcDayChunksNeedingWork } from './process/day-coverage.js';
import { loadHistoricalShapeNodes } from './process/load-historical-shape-nodes.js';
import { AppConfig } from './types/config.js';

/* * */

/**
 * Loads the ETA data into clickhouse.
 *
 * Every stage is incremental: rides, shapes and events already present are not
 * re-inserted, and node travel times are (re)built only for the UTC days that
 * need it (the newest two, plus any day still missing inside the window).
 * A run on a warm database therefore touches one or two days of data.
 *
 * @param config - The configuration for the loader.
 * @returns A promise that resolves when the data is loaded.
 */
export async function main(config: AppConfig) {
	//
	// Initialize the logger

	Logger.init();
	const globalTimer = new Timer();

	//
	// 1. Bootstrap
	if (config.stages._1_bootstrap) {
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
	//    Rides in the current window are still changing (observed start/end
	//    times), so the whole window is re-inserted; ReplacingMergeTree keeps
	//    the newest version per ride.

	if (config.stages._2_loadCurrentRides) {
		Logger.title('2. Loading current rides');
		await labDb.queryFromFile(sqlPath('hub', 'eta/loader/load-rides.sql'), {
			agency_ids: config.agencyIds.join(','),
			line_ids: '',
			require_pass: 0,
			skip_existing: 0,
			table_name: 'curr_rides',
			time_end: config.processing.currentRidesEndTime,
			time_start: config.processing.currentRidesStartTime,
		});

		Logger.progress({ message: 'Loaded current rides: curr_rides' });
	}

	//
	// 3. Load historical rides
	//    Only pass-grade rides, and only those not already in the table.

	if (config.stages._3_loadHistoricalRides) {
		Logger.title('3. Loading historical rides');
		await labDb.queryFromFile(sqlPath('hub', 'eta/loader/load-rides.sql'), {
			agency_ids: config.agencyIds.join(','),
			line_ids: '',
			require_pass: 1,
			skip_existing: 1,
			table_name: 'hist_rides',
			time_end: config.processing.historicalRidesEndTime,
			time_start: config.processing.historicalRidesStartTime,
		});

		Logger.progress({ message: 'Loaded historical rides: hist_rides' });
	}

	//
	// 4. Load historical shape nodes (new shapes only)

	if (config.stages._4_loadHistoricalShapeNodes) {
		Logger.title('4. Loading historical shape nodes');
		await loadHistoricalShapeNodes(config.processing.shapeNodeChunkLength, config.processing.geohashPrefixLength);
		Logger.progress({ message: 'Loaded historical shape nodes: hist_shape_nodes' });
	}

	//
	// 5. Load historical vehicle events
	//    One UTC day at a time, newest first, but only for days that need it:
	//    the newest two (late-arriving pings) and any day still empty.
	//    The query itself skips event ids already present, so re-running a
	//    day is idempotent.

	if (config.stages._5_loadHistoricalVehicleEvents) {
		Logger.title('5. Loading historical vehicle events');

		const chunks = await utcDayChunksNeedingWork('eta.hist_vehicle_events', config.processing.historicalRidesStartTime, config.processing.historicalRidesEndTime);

		for (const [index, chunk] of chunks.entries()) {
			Logger.progress({ message: `[${index + 1}/${chunks.length}] historical vehicle events ${chunk.yyyymmdd}` });
			await labDb.queryFromFile(sqlPath('hub', 'eta/loader/load-historical-vehicle-events.sql'), {
				chunk_end: chunk.end,
				chunk_start: chunk.start,
			});
		}
	}

	//
	// 6. Node travel times: build (per UTC day, partition replaced) and then
	//    aggregate only the operational days those partitions can affect.

	if (config.stages._6_calculateNodeTravelTimes) {
		Logger.title('6. Run Node Travel Times Transformation & Aggregation');

		Logger.info({ message: 'Building hist_node_travel_times for days that need it' });
		const rebuilt = await buildHistNodeTravelTimes(config.processing.historicalRidesStartTime, config.processing.historicalRidesEndTime);

		Logger.info({ message: `Aggregating hist_node_travel_times for ${rebuilt.length} rebuilt day(s)` });
		await aggregateHistNodeTravelTimes(rebuilt);

		//
		// The prediction view refreshes every 15 minutes on its own; trigger it now
		// so fresh aggregates reach eta.pred_node_etas (and, 30 s later, the stop
		// ETAs) without waiting for the next scheduled refresh. Stop ETAs read as 0
		// while pred_node_etas is empty, so on a first run this matters.

		if (rebuilt.length > 0) {
			try {
				await labDb.command({ query: 'SYSTEM REFRESH VIEW eta.mv_pred_node_etas' });
				Logger.progress({ message: 'Triggered refresh of mv_pred_node_etas' });
			} catch (error) {
				Logger.error({ error, message: 'Could not trigger mv_pred_node_etas refresh; it will run on its 15-minute schedule' });
			}
		}
	}

	//
	// 7. Current waypoints

	if (config.stages._7_loadCurrentWaypoints) {
		Logger.title('7. Loading and snapping current waypoints');

		await labDb.queryFromFile(sqlPath('hub', 'eta/loader/load-current-waypoints.sql'));
		Logger.progress({ message: 'Loaded current waypoints: curr_waypoints' });

		await labDb.queryFromFile(sqlPath('hub', 'eta/loader/snap-waypoints.sql'));
		Logger.progress({ message: 'Snapped waypoints: curr_waypoints_snapped' });
	}

	Logger.success(`ETA loaded in ${globalTimer.get()}.`);
}
