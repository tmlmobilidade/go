/* * */

import { Dates } from '@tmlmobilidade/go-utils-dates';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type GtfsRtFeedMessage } from '@tmlmobilidade/go-types-gtfs-rt';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { cacheGtfsByStop } from './cache-gtfs-by-stop.js';
import { cacheGtfsByTrip } from './cache-gtfs-by-trip.js';
import { cacheGtfsTripUpdatesByStop } from './cache-gtfs-trip-updates-by-stop.js';
import { cacheGtfsTripUpdatesByTrip } from './cache-gtfs-trip-updates-by-trip.js';
import { getClickHouseTripUpdates } from './get-clickhouse-trip-updates.js';
import { getCpTripUpdates } from './get-cp-trip-updates.js';

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
			timestamp: Dates.now('Europe/Lisbon').unix_timestamp / 1000,
		},
	};

	//
	// Get Clickhouse TripUpdates
	const clickhouseTripUpdates = await getClickHouseTripUpdates();
	clickhouseTripUpdates.forEach(tripUpdate => feedResult.entity.push({ id: tripUpdate.trip.trip_id, trip_update: tripUpdate }));
	// These come already from clickhouse as by-trip and by-stop
	await cacheGtfsByTrip();
	await cacheGtfsByStop();

	//
	// CP TripUpdates
	// const cpTripUpdates = await getCpTripUpdates();
	// cpTripUpdates.forEach(tripUpdate => feedResult.entity.push({ id: tripUpdate.trip.trip_id, trip_update: tripUpdate }));
	// // Cache the CP trip updates by trip and stop
	// await cacheGtfsTripUpdatesByTrip(cpTripUpdates);
	// await cacheGtfsTripUpdatesByStop(cpTripUpdates);

	//
	// Cache the feed result
	await cacheDb.set('hub:v1:realtime:eta:all:gtfs', JSON.stringify(feedResult));

	Logger.success(`Finished publishing GTFS-RT TripUpdate feed (${globalTimer.get()})`);

	//
};
