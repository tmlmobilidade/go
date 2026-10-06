/* * */

import { getOrganizationCacheKey } from '@tmlmobilidade/go-hub-pckg-utils';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { EXTERNAL_FEEDS } from '../external-feeds.js';
import { type TripStopEta } from '../types.js';
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
 * Rebuilds `eta:all`, `eta:by-trip:*`, and `eta:by-stop:*` from ClickHouse.
 * External feeds can later merge into those same keys via
 * {@link cacheEtasByTrip}, {@link cacheEtasByStop}, and {@link cacheEtasInAll}.
 */
export async function publishEtas(organizationId: string, agencyIds: string[]) {
	//

	Logger.title('Publishing trip stop ETAs...');

	const globalTimer = new Timer();

	// Rebuild ETA caches from ClickHouse SQL aggregations
	await cacheAllEtasFromClickHouse(organizationId, agencyIds);
	await cacheEtasFromClickHouseByTrip(organizationId, agencyIds);
	const currentStopIds = new Set(await cacheEtasFromClickHouseByStop(organizationId, agencyIds));

	for (const feed of EXTERNAL_FEEDS.filter(feed => agencyIds.includes(feed.agencyId))) {
		const etas = await getExternalEtas(organizationId, feed);
		await cacheEtasByTrip(organizationId, etas);
		await cacheEtasByStop(organizationId, etas, currentStopIds);
		await cacheEtasByAll(organizationId, etas);
	}

	// Remove detail snapshots no longer present after a successful rebuild and merge.
	const allEtasRaw = await cacheDb.get(getOrganizationCacheKey(organizationId, 'eta:all'));
	const allEtas: TripStopEta[] = allEtasRaw ? JSON.parse(allEtasRaw) : [];
	const currentKeys = new Set<string>(allEtas.flatMap(eta => [
		getOrganizationCacheKey(organizationId, `eta:by-stop:${eta.stop_id}`),
		getOrganizationCacheKey(organizationId, `eta:by-trip:${eta.trip_id}`),
	]));
	const detailKeys = (await Promise.all([
		cacheDb.scan(getOrganizationCacheKey(organizationId, 'eta:by-stop:*')),
		cacheDb.scan(getOrganizationCacheKey(organizationId, 'eta:by-trip:*')),
	])).flat();
	await cacheDb.deleteMany(detailKeys.filter(key => !currentKeys.has(key)));

	Logger.success(`Finished publishing trip stop ETAs (${globalTimer.get()})`);

	//
};
