/* * */

import { pipelinePath } from '@tmlmobilidade/go-hub-pckg-sql';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { TTL_REALTIME } from '@/config.js';

/* * */

/**
 * Writes the per-stop ETA Redis cache from ClickHouse Query Results.
 *
 * Runs `select-eta-by-stop-gtfs.sql`, which returns one pre-aggregated JSON
 * blob of GTFS-RT TripUpdates per stop, then writes each to
 * `hub:v1:realtime:eta:by-stop:{stopId}:gtfs`.
 *
 * Use this for the main ClickHouse-sourced ETA pipeline (full replace).
 * For merging in-memory TripUpdates from an external feed (e.g. CP), use
 * {@link cacheTripUpdatesByStop} instead.
 */
export async function cacheEtasFromClickHouseByStop() {
	//

	const timer = new Timer();

	Logger.info({ message: 'Retrieving GTFS-RT TripUpdates grouped by stop from ClickHouse...' });

	const tripUpdatesByStop = await labDb.queryFromFile<{ key: string, value: string }>(pipelinePath('select-eta-by-stop-gtfs.sql'));

	await Promise.all(tripUpdatesByStop.map(row => cacheDb.set(`hub:v1:realtime:eta:by-stop:${row.key}:gtfs`, row.value, TTL_REALTIME)));

	Logger.info({ message: `Cached ${tripUpdatesByStop.length} stop GTFS-RT groups in ${timer.get()}`, spacesAfterOrBefore: 1 });

	//
};
