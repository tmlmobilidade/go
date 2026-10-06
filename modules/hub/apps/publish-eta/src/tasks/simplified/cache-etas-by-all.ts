/* * */

import { getOrganizationCacheKey } from '@tmlmobilidade/go-hub-pckg-utils';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';

import { TTL_REALTIME } from '../../config.js';
import { type TripStopEta } from '../types.js';

/* * */

/**
 * Merges in-memory trip-stop ETAs into the full simplified ETA list cache.
 *
 * Replaces any existing entries whose `trip_id` appears in `etas`, then
 * appends the new ones to `hub:v1:{organizationId}:eta:all`.
 *
 * Use this for external feeds that produce `TripStopEta[]` in process (e.g. CP).
 * For a full rebuild from ClickHouse, use {@link cacheAllEtasFromClickHouse} instead.
 *
 * @param etas - Trip-stop ETAs to merge into the all-ETAs cache
 */
export async function cacheEtasByAll(organizationId: string, etas: TripStopEta[]) {
	//

	if (!etas.length) return;

	const raw = await cacheDb.get(getOrganizationCacheKey(organizationId, 'eta:all'));
	const allEtas: Record<string, unknown>[] = raw ? JSON.parse(raw) : [];
	const tripIds = new Set(etas.map(eta => eta.trip_id));
	const merged = [
		...allEtas.filter(eta => !tripIds.has(String(eta.trip_id))),
		...etas,
	];

	await cacheDb.set(getOrganizationCacheKey(organizationId, 'eta:all'), JSON.stringify(merged), TTL_REALTIME);

	//
};
