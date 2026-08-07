/* * */

import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type GtfsRtTripUpdate } from '@tmlmobilidade/go-types-gtfs-rt';

/* * */

export async function cacheGtfsTripUpdatesByTrip(tripUpdates: GtfsRtTripUpdate[]) {
	//

	await Promise.all(tripUpdates.flatMap((tripUpdate) => {
		const tripId = tripUpdate.trip?.trip_id;
		if (!tripId) return [];

		return [cacheDb.set(`hub:v1:realtime:eta:by-trip:${tripId}:gtfs`, JSON.stringify(tripUpdate))];
	}));

	//
};
