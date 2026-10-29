/* * */

import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { EXTERNAL_FEEDS } from '../external-feeds.js';
import { cacheEtasByAll } from './cache-etas-by-all.js';
import { cacheEtasByStop } from './cache-etas-by-stop.js';
import { cacheEtasByTrip } from './cache-etas-by-trip.js';
import { cacheAllEtasFromClickHouse } from './cache-etas-from-clickhouse-all.js';
import { cacheEtasFromClickHouseByStop } from './cache-etas-from-clickhouse-by-stop.js';
import { cacheEtasFromClickHouseByTrip } from './cache-etas-from-clickhouse-by-trip.js';
import { getExternalEtas } from './get-external-etas.js';

/* * */

/**
 * Publishes the simplified (non-GTFS) trip-stop ETA caches.
 *
 * With an agency ID, writes under `hub:v1:{agencyId}:realtime:eta`
 * and includes only that agency. Omitting it preserves the global feed.
 *
 * Rebuilds `eta:all`, `eta:by-trip:*`, and `eta:by-stop:*` from ClickHouse.
 * External feeds can later merge into those same keys via
 * {@link cacheEtasByTrip}, {@link cacheEtasByStop}, and {@link cacheEtasByAll}.
 */
export async function publishEtas(agencyId?: string) {
	//

	Logger.title('Publishing trip stop ETAs...');

	const globalTimer = new Timer();

	// Rebuild ETA caches from ClickHouse SQL aggregations
	await cacheAllEtasFromClickHouse(agencyId);
	await cacheEtasFromClickHouseByTrip(agencyId);
	await cacheEtasFromClickHouseByStop(agencyId);

	for (const feed of EXTERNAL_FEEDS.filter(feed => !agencyId || feed.agencyId === agencyId)) {
		const etas = await getExternalEtas(feed);
		await cacheEtasByTrip(etas, agencyId);
		await cacheEtasByStop(etas, agencyId);
		await cacheEtasByAll(etas, agencyId);
	}

	Logger.success(`Finished publishing trip stop ETAs (${globalTimer.get()})`);

	//
};
