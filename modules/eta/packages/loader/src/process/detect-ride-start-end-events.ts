/* * */

import { pipelinePath, qualifiedTable, queryEtaFromFile } from '@tmlmobilidade/go-eta-pckg-common';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger } from '@tmlmobilidade/logger';
import { readFile } from 'node:fs/promises';

import { type AppConfig } from '../types/config.js';

/* * */

const DETECT_RIDE_START_END_EVENTS_SQL_FILE = 'loader/detect-ride-start-end-events.sql';
const APPLY_RIDE_START_END_EVENTS_SQL_FILE = 'loader/apply-ride-start-end-events.sql';

/** Staging table holding the ride ids of the batch currently being detected. */
const BATCH_TABLE = '_detect_hist_rides_batch';
/** Staging table holding the detected start/end values for the current batch. */
const VALUES_TABLE = '_detect_hist_rides_values';

/** hist_rides per detect+mutation batch. */
const RIDE_EVENT_DETECTION_BATCH_SIZE = 500;

interface RideIdRow {
	_id: string
}

/**
 * Detects observed start/end times for historical rides directly in ClickHouse,
 * iterating over `hist_rides` in batches and UPDATING the existing rows in place.
 *
 * For each batch of rides this:
 *   - finds the matching `operation.simplified_vehicle_events` rows near the
 *     first/last stop (geohash-7 prefilter + great-circle residual within the
 *     buffer radius, scoped by trip_id and a window around the scheduled start),
 *   - computes `start_time_observed` = LAST event inside the first-stop buffer and
 *     `end_time_observed` = FIRST event inside the last-stop buffer,
 *   - stages those values and applies them with `ALTER TABLE hist_rides UPDATE`
 *     (a true in-place mutation; no re-insert).
 *
 * Runs between step 2 (insert historical rides) and step 3 (insert historical
 * vehicle events), because step 3 filters source events by these observed times.
 */
export async function detectRideStartEndEvents(config: AppConfig) {
	//

	Logger.title('2b. Detect historical ride start/end events');

	const histRidesTable = qualifiedTable('eta', 'hist_rides');
	const batchTable = qualifiedTable('eta', BATCH_TABLE);
	const valuesTable = qualifiedTable('eta', VALUES_TABLE);
	const client = await labDb.getClient();

	//
	// Create the staging tables once. They are truncated and repopulated per batch.

	await labDb.command({
		query: `CREATE TABLE IF NOT EXISTS ${batchTable} (_id String) ENGINE = MergeTree() ORDER BY _id`,
	});
	// Join engine keyed on _id so the apply mutation can use joinGet() for a
	// non-correlated key lookup (mutations cannot JOIN or correlate subqueries).
	await labDb.command({
		query: `CREATE TABLE IF NOT EXISTS ${valuesTable} (
			_id String,
			start_time_observed Nullable(UInt64),
			end_time_observed Nullable(UInt64)
		) ENGINE = Join(ANY, LEFT, _id)`,
	});

	//
	// Fetch every ride id currently in hist_rides (the table only holds in-window
	// rides). We loop over these in batches.

	const rideIdRows = await labDb.queryFromString<RideIdRow>(
		`SELECT DISTINCT _id FROM ${histRidesTable}`,
	);

	const rideIds = rideIdRows.map(row => row._id);
	Logger.info({ message: `Detecting start/end events for ${rideIds.length} historical rides in batches of ${RIDE_EVENT_DETECTION_BATCH_SIZE}` });

	//
	// Pre-read the mutation SQL once (the detect SQL is read per call by queryEtaFromFile).

	const applySql = await readFile(pipelinePath(APPLY_RIDE_START_END_EVENTS_SQL_FILE), { encoding: 'utf-8' });

	const detectParams = {
		buffer_radius_m: config.processing.stopGeofenceRadius,
		geohash_prefix_len: config.processing.geohashPrefixLength,
		ride_window_post_ms: Dates.standardWindowMilliseconds,
		ride_window_pre_ms: Dates.standardWindowMilliseconds,
	};

	const totalBatches = Math.ceil(rideIds.length / RIDE_EVENT_DETECTION_BATCH_SIZE);

	for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
		const batchIds = rideIds.slice(batchIndex * RIDE_EVENT_DETECTION_BATCH_SIZE, (batchIndex + 1) * RIDE_EVENT_DETECTION_BATCH_SIZE);
		Logger.progress({ message: `[${batchIndex + 1}/${totalBatches}] detecting ${batchIds.length} rides` });

		//
		// Reset the staging tables for this batch.

		await labDb.command({ query: `TRUNCATE TABLE ${batchTable}` });
		await labDb.command({ query: `TRUNCATE TABLE ${valuesTable}` });

		//
		// Stage the batch ride ids.

		await labDb.insert({
			format: 'JSONEachRow',
			table: batchTable,
			values: batchIds.map(_id => ({ _id })),
		});

		//
		// Detect: writes one row per ride into the values staging table.

		await labDb.queryFromFile(pipelinePath(DETECT_RIDE_START_END_EVENTS_SQL_FILE), detectParams);

		//
		// Apply: in-place mutation of hist_rides from the staged values. Run
		// synchronously so the staging tables can be safely truncated next batch.

		await labDb.command({
			clickhouse_settings: { mutations_sync: '2' },
			query: applySql,
		});
	}

	//
	// Drop the staging tables to leave a clean database.

	await labDb.command({ query: `DROP TABLE IF EXISTS ${batchTable}` });
	await labDb.command({ query: `DROP TABLE IF EXISTS ${valuesTable}` });

	Logger.progress({ message: 'Detected historical ride start/end events' });
}
