/* * */

import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { cacheAllEtasFromClickHouse } from './cache-etas-from-clickhouse-all.js';
import { cacheEtasFromClickHouseByStop } from './cache-etas-from-clickhouse-by-stop.js';
import { cacheEtasFromClickHouseByTrip } from './cache-etas-from-clickhouse-by-trip.js';

/* * */

/**
 * Publishes the simplified (non-GTFS) trip-stop ETA caches.
 *
 * Rebuilds `eta:all`, `eta:by-trip:*`, and `eta:by-stop:*` from ClickHouse.
 * External feeds (e.g. CP) can later merge into those same keys via
 * {@link cacheEtasByTrip}, {@link cacheEtasByStop}, and {@link cacheEtasInAll}.
 */
export async function publishEtas() {
	//

	Logger.title('Publishing trip stop ETAs...');

	const globalTimer = new Timer();

	// Rebuild ETA caches from ClickHouse SQL aggregations
	await cacheAllEtasFromClickHouse();
	await cacheEtasFromClickHouseByTrip();
	await cacheEtasFromClickHouseByStop();

	// External feed (e.g. CP): merge in-memory TripStopEta[] into the same keys
	// const cpEtas = await getCpEtas();
	// await cacheEtasByTrip(cpEtas);
	// await cacheEtasByStop(cpEtas);
	// await cacheEtasInAll(cpEtas);

	Logger.success(`Finished publishing trip stop ETAs (${globalTimer.get()})`);

	//
};
