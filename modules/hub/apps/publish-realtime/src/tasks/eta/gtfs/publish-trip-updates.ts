/* * */

import { Dates } from '@tmlmobilidade/go-utils-dates';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type GtfsRtFeedMessage } from '@tmlmobilidade/go-types-gtfs-rt';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { cacheEtasFromClickHouseByStop } from './cache-etas-from-clickhouse-by-stop.js';
import { cacheEtasFromClickHouseByTrip } from './cache-etas-from-clickhouse-by-trip.js';
import { getClickHouseTripUpdates } from './get-clickhouse-trip-updates.js';
import { TTL_REALTIME } from '@/config.js';

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
			timestamp: Dates.now('Europe/Lisbon').unix_milliseconds / 1000,
		},
	};

	//
	// Get Clickhouse TripUpdates
	const clickhouseTripUpdates = await getClickHouseTripUpdates();
	clickhouseTripUpdates.forEach(tripUpdate => feedResult.entity.push({ id: tripUpdate.trip.trip_id, trip_update: tripUpdate }));
	// Rebuild per-trip / per-stop ETA cache from ClickHouse SQL aggregations
	await cacheEtasFromClickHouseByTrip();
	await cacheEtasFromClickHouseByStop();

	//
	// CP TripUpdates
	// const cpTripUpdates = await getCpTripUpdates();
	// cpTripUpdates.forEach(tripUpdate => feedResult.entity.push({ id: tripUpdate.trip.trip_id, trip_update: tripUpdate }));
	// // Merge CP TripUpdates into the same per-trip / per-stop ETA cache keys
	// await cacheTripUpdatesByTrip(cpTripUpdates);
	// await cacheTripUpdatesByStop(cpTripUpdates);

	//
	// Cache the feed result
	await cacheDb.set('hub:v1:realtime:eta:all:gtfs', JSON.stringify(feedResult), TTL_REALTIME);

	Logger.success(`Finished publishing GTFS-RT TripUpdate feed (${globalTimer.get()})`);

	//
};
