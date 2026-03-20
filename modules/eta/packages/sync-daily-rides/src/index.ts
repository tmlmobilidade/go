/* * */

import { ClickHouseClient, clickhouseService } from '@tmlmobilidade/clickhouse';
import { Filter, hashedTrips, rides } from '@tmlmobilidade/interfaces';
import { HashedTrip, Ride } from '@tmlmobilidade/types';
import { ClickHouseWriter } from '@tmlmobilidade/writers';

import { dailyRideTableSchema, DailyTripWaypoint, dailyTripWaypointTableSchema } from './types.js';

/* * */

interface SyncDailyRidesOptions {
	batchSize: number
	client: ClickHouseClient
	ridesQuery: Filter<Ride>
}

export async function syncDailyRides({ batchSize = 100_000, client, ridesQuery }: SyncDailyRidesOptions) {
	//

	//
	// Setup Writers
	const ridesWriter = new ClickHouseWriter<Partial<Ride>>({
		batch_size: batchSize,
		client,
		table: 'daily_rides',
		tableSchema: dailyRideTableSchema,
	});

	const waypointsWriter = new ClickHouseWriter<DailyTripWaypoint>({
		batch_size: batchSize,
		client,
		table: 'daily_rides_waypoints',
		tableSchema: dailyTripWaypointTableSchema,
	});

	// Delete Tables
	await clickhouseService.deleteTable('daily_rides');
	await clickhouseService.deleteTable('daily_rides_waypoints');

	// Ensure Tables exist
	await ridesWriter.ensureTable();
	await waypointsWriter.ensureTable();

	const ridesCollection = await rides.getCollection();
	const ridesCursor = ridesCollection.find<Ride>(ridesQuery).batchSize(batchSize).stream();

	for await (const ride of ridesCursor as unknown as AsyncIterableIterator<Ride>) {
		await ridesWriter.write(ride);
	}

	// Get Distinct Hashed Trip IDs
	const distinctHashedTripIds = await rides.distinct('hashed_trip_id', ridesQuery);
	const hashedTripsCollection = await hashedTrips.getCollection();
	const hashedTripsCursor = hashedTripsCollection.find({ _id: { $in: distinctHashedTripIds } }).batchSize(batchSize).stream();

	for await (const hashedTrip of hashedTripsCursor as unknown as AsyncIterableIterator<HashedTrip>) {
		await waypointsWriter.write(hashedTrip.path.map(waypoint => ({
			...waypoint,
			hashed_trip_id: hashedTrip._id,
		})));
	}

	await ridesWriter.flush();
}
