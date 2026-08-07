/* * */

import { pipelinePath } from '@tmlmobilidade/go-hub-pckg-sql';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export async function cacheGtfsByStop() {
	//

	const timer = new Timer();

	Logger.info({ message: 'Retrieving GTFS-RT TripUpdates grouped by stop from ClickHouse...' });

	const tripUpdatesByStop = await labDb.queryFromFile<{ key: string, value: string }>(pipelinePath('select-eta-by-stop-gtfs.sql'));

	await Promise.all(tripUpdatesByStop.map(row => cacheDb.set(`hub:v1:realtime:eta:by-stop:${row.key}:gtfs`, row.value)));

	Logger.info({ message: `Cached ${tripUpdatesByStop.length} stop GTFS-RT groups in ${timer.get()}`, spacesAfterOrBefore: 1 });

	//
};
