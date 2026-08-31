/* * */

import { pipelinePath } from '@tmlmobilidade/go-hub-pckg-sql';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { type ClickHouseEtaKeyValue, type TripStopEta } from '../types.js';
import { groupEtasByTrip, toCachedEta } from './trip-updates-to-etas.js';
import { TTL_REALTIME } from '@/config.js';

/* * */

export async function cacheEtasByTripFromClickHouse() {
	//

	const timer = new Timer();

	Logger.info({ message: 'Retrieving trip stop ETAs grouped by trip from ClickHouse...' });

	const etasByTrip = await labDb.queryFromFile<ClickHouseEtaKeyValue>(pipelinePath('select-eta-by-trip.sql'));

	await Promise.all(etasByTrip.map(row => cacheDb.set(`hub:v1:realtime:eta:by-trip:${row.key}`, row.value, TTL_REALTIME)));

	Logger.info({ message: `Cached ${etasByTrip.length} trip ETA groups in ${timer.get()}`, spacesAfterOrBefore: 1 });

	//
};

export async function cacheEtasByTrip(etas: TripStopEta[]) {
	//

	await Promise.all([...groupEtasByTrip(etas).entries()].map(async ([tripId, tripEtas]) => {
		const sorted = [...tripEtas].sort((a, b) => a.stop_sequence - b.stop_sequence);
		await cacheDb.set(`hub:v1:realtime:eta:by-trip:${tripId}`, JSON.stringify(sorted.map(toCachedEta)), TTL_REALTIME);
	}));

	//
};
