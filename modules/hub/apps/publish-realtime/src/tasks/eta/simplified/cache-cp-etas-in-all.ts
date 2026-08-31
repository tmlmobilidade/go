/* * */

import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';

import { type TripStopEta } from '../types.js';
import { TTL_REALTIME } from '@/config.js';

/* * */

export async function cacheCpEtasInAll(etas: TripStopEta[]) {
	//

	if (!etas.length) return;

	const raw = await cacheDb.get('hub:v1:realtime:eta:all');
	const allEtas: Record<string, unknown>[] = raw ? JSON.parse(raw) : [];
	const cpTripIds = new Set(etas.map(eta => eta.trip_id));
	const merged = [
		...allEtas.filter(eta => !cpTripIds.has(String(eta.trip_id))),
		...etas,
	];

	await cacheDb.set('hub:v1:realtime:eta:all', JSON.stringify(merged), TTL_REALTIME);

	//
};
