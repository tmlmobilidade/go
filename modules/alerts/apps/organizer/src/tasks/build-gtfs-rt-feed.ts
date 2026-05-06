/* * */

import { apiCache } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { transformAlert } from '@tmlmobilidade/go-alerts-pckg-transform';
import { alerts } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type GtfsRtFeedEntity, type GtfsRtFeedMessage } from '@tmlmobilidade/types';

/* * */

export async function buildGtfsRtFeed() {
	//

	Logger.title('Starting build of GTFS-RT feed...');

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

	Logger.info(`Retrieved ${findResult.length} active alerts...`);

	//
	// Transform alerts into GTFS-RT feed entities

	const transformedItems = await Promise.all(findResult.map(transformAlert));

	const transformResult: GtfsRtFeedEntity[] = transformedItems.filter(Boolean);

	Logger.info(`Transformed ${transformResult.length} alerts into GTFS-RT feed entities (${globalTimer.get()})`);

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

	await apiCache.set('alerts:all', JSON.stringify(gtfsRtFeed));

	Logger.success(`Finished organizing alert structure (${globalTimer.get()})`);

	//
};
