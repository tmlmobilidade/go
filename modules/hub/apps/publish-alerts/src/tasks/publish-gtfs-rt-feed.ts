/* * */

import { transformAlertIntoGtfsRtEntity } from '@/transform/gtfs-rt/main.js';
import { apiCache } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { alerts } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type GtfsRtFeedEntity, type GtfsRtFeedMessage } from '@tmlmobilidade/types';

/* * */

export async function publishGtfsRtFeed() {
	//

	Logger.title('Publishing GTFS-RT feed...');

	const globalTimer = new Timer();

	//
	// Retrieve active alerts from the database

	const findResult = await alerts.findMany(
		{
			$and: [
				{
					$or: [
						{ publish_end_date: { $gte: Dates.now('Europe/Lisbon').unix_timestamp } },
						{ publish_end_date: null },
						{ publish_end_date: undefined },
						{ publish_end_date: { $exists: false } },
					],
					publish_start_date: { $lte: Dates.now('Europe/Lisbon').unix_timestamp },
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

	const transformedItems = await Promise.all(findResult.map(transformAlertIntoGtfsRtEntity));

	const transformResult: GtfsRtFeedEntity[] = transformedItems.filter(Boolean);

	Logger.info({ message: `Transformed ${transformResult.length} alerts into GTFS-RT feed entities (${globalTimer.get()})` });

	//
	// Save the result in API Cache

	const gtfsRtFeed: GtfsRtFeedMessage = {
		entity: transformResult,
		header: {
			gtfs_realtime_version: '2.0',
			incrementality: 'FULL_DATASET',
			timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
		},
	};

	await apiCache.set('hub:v1:alerts:published:gtfs', JSON.stringify(gtfsRtFeed));

	Logger.success(`Finished publishing GTFS-RT feed (${globalTimer.get()})`);

	//
};
