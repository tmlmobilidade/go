/* * */

import type { AppConfig } from '@/lib/config.js';

import { pipelinePath, qualifiedTable, queryEtaFromFile, substituteEtaDatabase } from '@tmlmobilidade/go-eta-pckg-common';
import { Logger } from '@tmlmobilidade/logger';
import { readFile } from 'node:fs/promises';

/* * */

const DETECT_RIDE_START_END_EVENTS_SQL_FILE = 'loader/detect-ride-start-end-events.sql';
const APPLY_RIDE_START_END_EVENTS_SQL_FILE = 'loader/apply-ride-start-end-events.sql';

/** Staging table holding the ride ids of the batch currently being detected. */
const BATCH_TABLE = '_detect_hist_rides_batch';
/** Staging table holding the detected start/end values for the current batch. */
const VALUES_TABLE = '_detect_hist_rides_values';

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
export async function detectRideStartEndEvents(clickhouseClient: Parameters<typeof queryEtaFromFile>[0], config: AppConfig) {
	//

	Logger.title('2b. Detect historical ride start/end events');

	const histRidesTable = qualifiedTable(config.database, 'hist_rides');
	const batchTable = qualifiedTable(config.database, BATCH_TABLE);
	const valuesTable = qualifiedTable(config.database, VALUES_TABLE);

	//
	// Create the staging tables once. They are truncated and repopulated per batch.

	await clickhouseClient.command({
		query: `CREATE TABLE IF NOT EXISTS ${batchTable} (_id String) ENGINE = MergeTree() ORDER BY _id`,
	});
	// Join engine keyed on _id so the apply mutation can use joinGet() for a
	// non-correlated key lookup (mutations cannot JOIN or correlate subqueries).
	await clickhouseClient.command({
		query: `CREATE TABLE IF NOT EXISTS ${valuesTable} (
			_id String,
			start_time_observed Nullable(UInt64),
			end_time_observed Nullable(UInt64)
		) ENGINE = Join(ANY, LEFT, _id)`,
	});

	//
	// Fetch every ride id currently in hist_rides (the table only holds in-window
	// rides). We loop over these in batches.

	const rideIdRows = await clickhouseClient.query({
		format: 'JSONEachRow',
		query: `SELECT DISTINCT _id FROM ${histRidesTable}`,
	}).then(result => result.json<RideIdRow>());

	const rideIds = rideIdRows.map(row => row._id);
	Logger.info(`Detecting start/end events for ${rideIds.length} historical rides in batches of ${config.rideEventDetectionBatchSize}`);

	//
	// Pre-read + database-substitute the mutation SQL once (the detect SQL is read
	// and substituted per call by queryEtaFromFile).

	const applySql = substituteEtaDatabase(config.database, await readFile(pipelinePath(APPLY_RIDE_START_END_EVENTS_SQL_FILE), { encoding: 'utf-8' }));

	const detectParams = {
		buffer_radius_m: config.rideEventBufferRadiusMeters,
		geohash_prefix_len: config.rideEventGeohashPrefixLength,
		ride_window_post_ms: config.rideEventWindowPostMs,
		ride_window_pre_ms: config.rideEventWindowPreMs,
	};

	const totalBatches = Math.ceil(rideIds.length / config.rideEventDetectionBatchSize);

	for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
		const batchIds = rideIds.slice(batchIndex * config.rideEventDetectionBatchSize, (batchIndex + 1) * config.rideEventDetectionBatchSize);
		Logger.progress(`[${batchIndex + 1}/${totalBatches}] detecting ${batchIds.length} rides`);

		//
		// Reset the staging tables for this batch.

		await clickhouseClient.command({ query: `TRUNCATE TABLE ${batchTable}` });
		await clickhouseClient.command({ query: `TRUNCATE TABLE ${valuesTable}` });

		//
		// Stage the batch ride ids.

		await clickhouseClient.insert({
			format: 'JSONEachRow',
			table: batchTable,
			values: batchIds.map(_id => ({ _id })),
		});

		//
		// Detect: writes one row per ride into the values staging table.

		await queryEtaFromFile(clickhouseClient, config.database, pipelinePath(DETECT_RIDE_START_END_EVENTS_SQL_FILE), detectParams);

		//
		// Apply: in-place mutation of hist_rides from the staged values. Run
		// synchronously so the staging tables can be safely truncated next batch.

		await clickhouseClient.command({
			clickhouse_settings: { mutations_sync: '2' },
			query: applySql,
		});
	}

	//
	// Drop the staging tables to leave a clean database.

	await clickhouseClient.command({ query: `DROP TABLE IF EXISTS ${batchTable}` });
	await clickhouseClient.command({ query: `DROP TABLE IF EXISTS ${valuesTable}` });

	Logger.progress('Detected historical ride start/end events');
}
