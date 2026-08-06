/* * */

import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { type TripStopEta } from '../types.js';
import { getClickHouseEtas } from './get-clickhouse-etas.js';

/* * */

export async function cacheAllEtas(): Promise<TripStopEta[]> {
	//

	const timer = new Timer();

	const etas = await getClickHouseEtas();

	await cacheDb.set('hub:v1:realtime:eta:all', JSON.stringify(etas));

	Logger.info({ message: `Cached ${etas.length} trip stop ETAs in ${timer.get()}`, spacesAfterOrBefore: 1 });

	return etas;

	//
};
