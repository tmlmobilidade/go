/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { sqlPath } from '@tmlmobilidade/go-utils-sql';
import { Logger } from '@tmlmobilidade/logger';

import { lisbonYyyymmdd, utcYyyymmdd } from '../process/day-coverage.js';
import { type AppConfig } from '../types/config.js';
import { runCountedCleanup } from './run-counted-cleanup.js';

/* * */

const NODE_TRAVEL_TIMES_TABLE = 'eta.hist_node_travel_times';

interface PartitionRow {
	partition_id: string
	rows: number | string
}

/* * */

/**
 * Ages every ETA table out of the windows the loader just refreshed.
 *
 * Runs at the end of each loader cycle, so it always sees the windows the
 * loader used and can never race with an insert. Every step is bounded by the
 * same `config.processing.*` values that drive the loader, which is what keeps
 * the two consistent: nothing is deleted that the loader would re-insert on the
 * next cycle, and nothing the loader stopped inserting is kept.
 *
 * Order matters only for the orphan steps: rides first, then the tables that
 * reference them.
 */
export async function cleanup(config: AppConfig): Promise<void> {
	const { currentRidesStartTime, historicalRidesStartTime } = config.processing;

	//
	// 8.1 Current rides that left the current window.
	//     Must use the loader's own cut-off: the live snapper and the ETA views
	//     inner-join curr_rides, so deleting a ride still in the window would
	//     blank its ETAs until the next cycle re-inserts it.

	Logger.info({ message: '8.1 Current rides out of window' });
	await runCountedCleanup(sqlPath('hub', 'eta/cleanup/1-delete-out-of-window-curr-rides.sql'), {
		window_start: currentRidesStartTime,
	});

	//
	// 8.2 Waypoints (raw and snapped) of trips no longer in curr_rides.

	Logger.info({ message: '8.2 Orphan current waypoints' });
	await runCountedCleanup(sqlPath('hub', 'eta/cleanup/2-delete-orphan-curr-waypoints.sql'));

	//
	// 8.3 Historical rides that left the historical window.

	Logger.info({ message: '8.3 Historical rides out of window' });
	await runCountedCleanup(sqlPath('hub', 'eta/cleanup/3-delete-out-of-window-hist-rides.sql'), {
		window_start: historicalRidesStartTime,
	});

	//
	// 8.4 Node travel times: drop whole UTC-day partitions before the window.

	Logger.info({ message: '8.4 Node travel time partitions out of window' });
	const partitions = await labDb.queryFromFile<PartitionRow>(sqlPath('hub', 'eta/cleanup/4-list-out-of-window-hist-node-travel-times-partitions.sql'), {
		min_partition: utcYyyymmdd(historicalRidesStartTime),
	});

	let rowsDropped = 0;
	for (const partition of partitions) {
		if (!/^\d{8}$/.test(partition.partition_id)) continue;
		await labDb.command({ query: `ALTER TABLE ${NODE_TRAVEL_TIMES_TABLE} DROP PARTITION ${partition.partition_id}` });
		rowsDropped += Number(partition.rows);
	}
	Logger.progress({ message: `Dropped ${partitions.length} partitions (${rowsDropped} rows)` });

	//
	// 8.5 Daily aggregates before the window (operational dates are Europe/Lisbon).

	Logger.info({ message: '8.5 Aggregates out of window' });
	await runCountedCleanup(sqlPath('hub', 'eta/cleanup/5-delete-out-of-window-hist-node-travel-times-aggregation.sql'), {
		min_operational_date: lisbonYyyymmdd(historicalRidesStartTime),
	});

	//
	// 8.6 Shape nodes no ride references any more (rare).

	Logger.info({ message: '8.6 Orphan shape nodes' });
	await runCountedCleanup(sqlPath('hub', 'eta/cleanup/6-delete-orphan-hist-shape-nodes.sql'));

	//
	// Current vehicle events are not touched here: the table carries a 2-hour
	// TTL and only ever receives pings of trips in curr_rides.
}
