/* * */

import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type GtfsRtTripUpdate } from '@tmlmobilidade/go-types-gtfs-rt';

/* * */

/**
 * Writes in-memory GTFS-RT TripUpdates into the per-trip ETA cache.
 *
 * For each TripUpdate with a `trip_id`, overwrites
 * `hub:v1:realtime:eta:by-trip:{tripId}:gtfs` with that TripUpdate as JSON.
 *
 * Use this for external feeds that produce TripUpdate objects in process
 * (e.g. CP). For a full rebuild from ClickHouse SQL, use
 * {@link cacheEtasFromClickHouseByTrip} instead.
 *
 * @param tripUpdates - TripUpdates to write into the trip-keyed cache
 */
export async function cacheTripUpdatesByTrip(tripUpdates: GtfsRtTripUpdate[]) {
	//

	await Promise.all(tripUpdates.flatMap((tripUpdate) => {
		const tripId = tripUpdate.trip?.trip_id;
		if (!tripId) return [];

		return [cacheDb.set(`hub:v1:realtime:eta:by-trip:${tripId}:gtfs`, JSON.stringify(tripUpdate))];
	}));

	//
};
