/* * */

import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type GtfsRtFeedMessage } from '@tmlmobilidade/go-types-gtfs-rt';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import { Timer } from '@tmlmobilidade/timer';

import { TTL_REALTIME } from '../../config.js';
import { EXTERNAL_FEEDS } from '../external-feeds.js';
import { getClickHouseTripUpdates } from './get-clickhouse-trip-updates.js';
import { getExternalTripUpdates } from './get-external-trip-updates.js';

/* * */

export async function publishTripUpdates() {
	//

	Logger.title('Publishing GTFS-RT TripUpdate feed...');

	const globalTimer = new Timer();

	const feedResult: GtfsRtFeedMessage = {
		entity: [],
		header: {
			gtfs_realtime_version: '2.0',
			incrementality: 'FULL_DATASET',
			timestamp: Dates.now('Europe/Lisbon').unix_seconds,
		},
	};

	//
	// Get Clickhouse TripUpdates
	const clickhouseTripUpdates = await getClickHouseTripUpdates();
	clickhouseTripUpdates.forEach(tripUpdate => feedResult.entity.push({ id: tripUpdate.trip.trip_id, trip_update: tripUpdate }));

	for (const feed of EXTERNAL_FEEDS) {
		Logger.info({ message: `Retrieving TripUpdates from ${feed.label} API...` });
		const tripUpdates = await getExternalTripUpdates(feed);
		tripUpdates.forEach(tripUpdate => feedResult.entity.push({ id: tripUpdate.trip.trip_id, trip_update: tripUpdate }));
	}

	//
	// Cache the feed result
	await cacheDb.set('hub:v1:realtime:eta:all:gtfs', JSON.stringify(feedResult), TTL_REALTIME);

	Logger.success(`Finished publishing GTFS-RT TripUpdate feed (${globalTimer.get()})`);

	//
};
