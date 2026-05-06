/* * */

import { hashedTrips } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export async function syncCurrentWaypoints(clickhouseClient, hashedTripIds: string[]) {
	//

	Logger.title('6. Insert current window waypoints into clickhouse');

	const hashedTripsCollection = await hashedTrips.getCollection();
	const hashedTripsCursor = hashedTripsCollection.find({ _id: { $in: hashedTripIds } }).batchSize(10_000).stream();

	let waypointsCount = 0;
	for await (const hashedTrip of hashedTripsCursor) {
		waypointsCount += hashedTrip.path.length;
		clickhouseClient.insert({
			format: 'JSONEachRow',
			table: 'eta.curr_waypoints',
			values: hashedTrip.path.map(waypoint => ({
				...waypoint,
				hashed_trip_id: hashedTrip._id,
			})),
		});
	}

	Logger.progress(`Found ${waypointsCount} waypoints`);
}
