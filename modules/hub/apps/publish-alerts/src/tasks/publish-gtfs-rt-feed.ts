/* * */

import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type GtfsRtFeedEntity, type GtfsRtFeedMessage } from '@tmlmobilidade/go-types-gtfs-rt';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { transformAlertIntoGtfsRtEntity } from '../transform/gtfs-rt/main.js';

/* * */

export async function publishGtfsRtFeed(agencyId: string) {
	//

	Logger.info({ message: `Publishing GTFS-RT feed` });

	const globalTimer = new Timer();

	//
	// Retrieve active alerts from the database

	const findResult = await goDb.operation.alerts.findMany(
		{
			$and: [
				{
					publish_end_date: { $gte: Dates.now('Europe/Lisbon').unix_milliseconds },
					publish_start_date: { $lte: Dates.now('Europe/Lisbon').unix_milliseconds },
					publish_status: 'published',
				},
			],
		},
		{
			sort: { created_at: -1 },
		},
	);

	Logger.info({ message: `Retrieved ${findResult.length} active alerts...` });

	//
	// Transform alerts into GTFS-RT feed entities

	const transformedItems = await Promise.all(findResult.map(async alert => ({
		agency_id: alert.agency_id,
		entity: await transformAlertIntoGtfsRtEntity(alert),
	})));

	const transformResult: GtfsRtFeedEntity[] = transformedItems.flatMap(item => item.entity ? [item.entity] : []);

	Logger.info({ message: `Transformed ${transformResult.length} alerts into GTFS-RT feed entities (${globalTimer.get()})` });

	//
	// Save the result in API Cache

	const gtfsRtFeed: GtfsRtFeedMessage = {
		entity: transformResult,
		header: {
			gtfs_realtime_version: '2.0',
			incrementality: 'FULL_DATASET',
			timestamp: Dates.now('Europe/Lisbon').unix_seconds,
		},
	};

	await cacheDb.set(`hub:v1:${agencyId}:alerts:published:gtfs`, JSON.stringify(gtfsRtFeed));

	Logger.success({ message: `Finished publishing GTFS-RT feed (${globalTimer.get()})` });

	//
};
