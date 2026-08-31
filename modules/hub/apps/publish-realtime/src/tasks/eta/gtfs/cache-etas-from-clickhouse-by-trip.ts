/* * */

import { pipelinePath } from '@tmlmobilidade/go-hub-pckg-sql';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { TTL_REALTIME } from '@/config.js';

/* * */

/**
 * Writes the per-trip ETA Redis cache from ClickHouse Query Results.
 *
 * Runs `select-eta-by-trip-gtfs.sql`, which returns one pre-aggregated JSON
 * TripUpdate per trip, then writes each to
 * `hub:v1:realtime:eta:by-trip:{tripId}:gtfs`.
 *
 * Use this for the main ClickHouse-sourced ETA pipeline (full replace).
 * For writing in-memory TripUpdates from an external feed (e.g. CP), use
 * {@link cacheTripUpdatesByTrip} instead.
 */
export async function cacheEtasFromClickHouseByTrip() {
	//

	const timer = new Timer();

	Logger.info({ message: 'Retrieving GTFS-RT TripUpdates grouped by trip from ClickHouse...' });

	const tripUpdatesByTrip = await labDb.queryFromFile<{ key: string, value: string }>(pipelinePath('select-eta-by-trip-gtfs.sql'));

	await Promise.all(tripUpdatesByTrip.map(row => cacheDb.set(`hub:v1:realtime:eta:by-trip:${row.key}:gtfs`, row.value, TTL_REALTIME)));

	Logger.info({ message: `Cached ${tripUpdatesByTrip.length} trip GTFS-RT groups in ${timer.get()}`, spacesAfterOrBefore: 1 });

	//
};
