/* * */

import { etaDailyRides, etaDailyRidesWaypoints } from '@tmlmobilidade/databases';
import { Filter, hashedTrips, rides } from '@tmlmobilidade/interfaces';
import { HashedTrip, Ride } from '@tmlmobilidade/types';
import { BatchWriter } from '@tmlmobilidade/utils';

/* * */

const BATCH_SIZE = 100_000;

interface SyncDailyRidesOptions {
	ridesQuery: Filter<Ride>
}

export async function syncDailyRides({ ridesQuery }: SyncDailyRidesOptions) {
	//

	//
	// Setup Writers
	const ridesWriter = new BatchWriter<Partial<Ride>>({
		batch_size: BATCH_SIZE,
		insertFn: async (data) => {
			await etaDailyRides.insert('JSONEachRow', data);
		},
		title: 'daily_rides',
	});

	const waypointsWriter = new BatchWriter({
		batch_size: BATCH_SIZE,
		insertFn: async (data) => {
			await etaDailyRidesWaypoints.insert('JSONEachRow', data);
		},
		title: 'daily_rides_waypoints',
	});

	// Clear Tables
	await etaDailyRides.clearData();
	await etaDailyRidesWaypoints.clearData();

	const ridesCollection = await rides.getCollection();
	const ridesCursor = ridesCollection.find<Ride>(ridesQuery).batchSize(BATCH_SIZE).stream();

	let ridesCount = 0;
	for await (const ride of ridesCursor as unknown as AsyncIterableIterator<Ride>) {
		ridesCount++;
		await ridesWriter.write(ride);
	}

	// Get Distinct Hashed Trip IDs
	const distinctHashedTripIds = await rides.distinct('hashed_trip_id', ridesQuery);
	const hashedTripsCollection = await hashedTrips.getCollection();
	const hashedTripsCursor = hashedTripsCollection.find({ _id: { $in: distinctHashedTripIds } }).batchSize(BATCH_SIZE).stream();

	let waypointsCount = 0;
	for await (const hashedTrip of hashedTripsCursor as unknown as AsyncIterableIterator<HashedTrip>) {
		waypointsCount += hashedTrip.path.length;
		await waypointsWriter.write(hashedTrip.path.map(waypoint => ({
			...waypoint,
			hashed_trip_id: hashedTrip._id,
		})));
	}

	await ridesWriter.flush();
	await waypointsWriter.flush();

	return { ridesCount, waypointsCount };
}
