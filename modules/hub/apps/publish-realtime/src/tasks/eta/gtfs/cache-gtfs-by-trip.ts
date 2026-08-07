/* * */

import { pipelinePath } from '@tmlmobilidade/go-hub-pckg-sql';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export async function cacheGtfsByTrip() {
	//

	const timer = new Timer();

	Logger.info({ message: 'Retrieving GTFS-RT TripUpdates grouped by trip from ClickHouse...' });

	const tripUpdatesByTrip = await labDb.queryFromFile<{ key: string, value: string }>(pipelinePath('select-eta-by-trip-gtfs.sql'));

	await Promise.all(tripUpdatesByTrip.map(row => cacheDb.set(`hub:v1:realtime:eta:by-trip:${row.key}:gtfs`, row.value)));

	Logger.info({ message: `Cached ${tripUpdatesByTrip.length} trip GTFS-RT groups in ${timer.get()}`, spacesAfterOrBefore: 1 });

	//
};
