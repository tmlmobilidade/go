/* * */

import { pipelinePath } from '@tmlmobilidade/go-hub-pckg-sql';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { type ClickHouseEtaKeyValue, type TripStopEta, type TripStopEtaCached } from '../types.js';
import { groupEtasByStop, toCachedEta } from './trip-updates-to-etas.js';

/* * */

export async function cacheEtasByStopFromClickHouse() {
	//

	const timer = new Timer();

	Logger.info({ message: 'Retrieving trip stop ETAs grouped by stop from ClickHouse...' });

	const etasByStop = await labDb.queryFromFile<ClickHouseEtaKeyValue>(pipelinePath('select-eta-by-stop.sql'));

	await Promise.all(etasByStop.map(row => cacheDb.set(`hub:v1:realtime:eta:by-stop:${row.key}`, row.value)));

	Logger.info({ message: `Cached ${etasByStop.length} stop ETA groups in ${timer.get()}`, spacesAfterOrBefore: 1 });

	//
};

export async function cacheEtasByStop(etas: TripStopEta[]) {
	//

	await Promise.all([...groupEtasByStop(etas).entries()].map(async ([stopId, stopEtas]) => {
		const existing = await cacheDb.get(`hub:v1:realtime:eta:by-stop:${stopId}`);
		const merged: TripStopEtaCached[] = existing ? JSON.parse(existing) : [];

		for (const eta of stopEtas.map(toCachedEta)) {
			const index = merged.findIndex(row => row.trip_id === eta.trip_id && row.stop_sequence === eta.stop_sequence);
			if (index >= 0) merged[index] = eta;
			else merged.push(eta);
		}

		merged.sort((a, b) => Number(a.stop_sequence) - Number(b.stop_sequence));

		await cacheDb.set(`hub:v1:realtime:eta:by-stop:${stopId}`, JSON.stringify(merged));
	}));

	//
};
