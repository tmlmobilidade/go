/* * */

import { pipelinePath } from '@tmlmobilidade/go-hub-pckg-sql';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

interface ClickHouseEtaKeyValue {
	key: string
	value: string
}

/* * */

export async function publishEtas() {
	//

	Logger.title('Publishing trip stop ETAs...');

	const globalTimer = new Timer();

	//
	// Full trip-stop ETAs dataset

	const fullTimer = new Timer();

	Logger.info({ message: 'Retrieving all trip stop ETAs from ClickHouse...' });

	const allTripStopEtas = await labDb.queryFromFile<Record<string, unknown>>(pipelinePath('select-eta.sql'));

	await cacheDb.set('hub:v1:realtime:eta:all', JSON.stringify(allTripStopEtas));

	Logger.info({ message: `Cached ${allTripStopEtas.length} trip stop ETAs in ${fullTimer.get()}`, spacesAfterOrBefore: 1 });

	//
	// ETAs grouped by trip

	const byTripTimer = new Timer();

	Logger.info({ message: 'Retrieving trip stop ETAs grouped by trip from ClickHouse...' });

	const etasByTrip = await labDb.queryFromFile<ClickHouseEtaKeyValue>(pipelinePath('select-eta-by-trip.sql'));

	await Promise.all(etasByTrip.map(row => cacheDb.set(`hub:v1:realtime:eta:by-trip:${row.key}`, row.value)));

	Logger.info({ message: `Cached ${etasByTrip.length} trip ETA groups in ${byTripTimer.get()}`, spacesAfterOrBefore: 1 });

	//
	// ETAs grouped by stop

	const byStopTimer = new Timer();

	Logger.info({ message: 'Retrieving trip stop ETAs grouped by stop from ClickHouse...' });

	const etasByStop = await labDb.queryFromFile<ClickHouseEtaKeyValue>(pipelinePath('select-eta-by-stop.sql'));

	await Promise.all(etasByStop.map(row => cacheDb.set(`hub:v1:realtime:eta:by-stop:${row.key}`, row.value)));

	Logger.info({ message: `Cached ${etasByStop.length} stop ETA groups in ${byStopTimer.get()}`, spacesAfterOrBefore: 1 });

	Logger.success(`Finished publishing trip stop ETAs (${globalTimer.get()})`);

	//
};
