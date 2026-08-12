/* * */

import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { Logger } from '@tmlmobilidade/logger-logger-backend';
import { Timer } from '@tmlmobilidade/timer';

import { cacheAllEtas } from './cache-all-etas.js';
import { cacheCpEtasInAll } from './cache-cp-etas-in-all.js';
import { cacheEtasByStop, cacheEtasByStopFromClickHouse } from './cache-etas-by-stop.js';
import { cacheEtasByTrip, cacheEtasByTripFromClickHouse } from './cache-etas-by-trip.js';
import { getCpEtas } from './get-cp-etas.js';

/* * */

export async function publishEtas() {
	//

	Logger.title('Publishing trip stop ETAs...');

	const globalTimer = new Timer();

	await cacheAllEtas();
	await cacheEtasByTripFromClickHouse();
	await cacheEtasByStopFromClickHouse();

	// const cpEtas = await getCpEtas();
	// await cacheEtasByTrip(cpEtas);
	// await cacheEtasByStop(cpEtas);
	// await cacheCpEtasInAll(cpEtas);

	Logger.success(`Finished publishing trip stop ETAs (${globalTimer.get()})`);

	//
};
