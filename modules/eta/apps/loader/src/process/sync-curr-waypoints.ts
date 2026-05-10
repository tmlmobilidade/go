/* * */

import { hashedTrips } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { BatchWriter } from '@tmlmobilidade/utils';

/* * */

export async function syncCurrentWaypoints(clickhouseClient: any, hashedTripIds: string[]) {
	//

	Logger.title('6. Insert current window waypoints into clickhouse');

	const writer = new BatchWriter({
		batch_size: 10_000,
		insertFn: async (data) => {
			await clickhouseClient.insert({
				format: 'JSONEachRow',
				table: 'eta.curr_waypoints',
				values: data,
			});
		},
		title: 'eta.curr_waypoints',
	});

	const hashedTripsCollection = await hashedTrips.getCollection();
	const hashedTripsCursor = hashedTripsCollection.find({ _id: { $in: hashedTripIds } }).batchSize(10_000).stream();

	let waypointsCount = 0;
	for await (const hashedTrip of hashedTripsCursor) {
		waypointsCount += hashedTrip.path.length;
		for (const waypoint of hashedTrip.path) {
			await writer.write({
				...waypoint,
				hashed_trip_id: hashedTrip._id,
			});
		}
	}

	await writer.flush();

	Logger.progress(`Found ${waypointsCount} waypoints`);
}
