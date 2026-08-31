/* * */

import { TTL_REALTIME } from '@/config.js';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type GtfsRtTripUpdate } from '@tmlmobilidade/go-types-gtfs-rt';

/* * */

/**
 * Upserts in-memory GTFS-RT TripUpdates into the per-stop ETA cache.
 *
 * Splits each TripUpdate into one entry per `stop_time_update`, groups by
 * `stop_id`, then merges into the existing Redis value at
 * `hub:v1:realtime:eta:by-stop:{stopId}:gtfs` (replace same `trip_id`, append otherwise).
 *
 * Use this for external feeds that produce TripUpdate objects in process
 * (e.g. CP). For a full rebuild from ClickHouse SQL, use
 * {@link cacheEtasFromClickHouseByStop} instead.
 *
 * @param tripUpdates - TripUpdates to merge into the stop-keyed cache
 */
export async function cacheTripUpdatesByStop(tripUpdates: GtfsRtTripUpdate[]) {
	//

	const byStopUpdates = new Map<string, GtfsRtTripUpdate[]>();

	for (const tripUpdate of tripUpdates) {
		for (const stopTimeUpdate of tripUpdate.stop_time_update ?? []) {
			if (!stopTimeUpdate.stop_id) continue;

			const perStopTripUpdate: GtfsRtTripUpdate = {
				...tripUpdate,
				stop_time_update: [stopTimeUpdate],
			};
			const stopTripUpdates = byStopUpdates.get(stopTimeUpdate.stop_id) ?? [];
			stopTripUpdates.push(perStopTripUpdate);
			byStopUpdates.set(stopTimeUpdate.stop_id, stopTripUpdates);
		}
	}

	await Promise.all([...byStopUpdates.entries()].map(async ([stopId, updates]) => {
		const existing = await cacheDb.get(`hub:v1:realtime:eta:by-stop:${stopId}:gtfs`);
		const merged: GtfsRtTripUpdate[] = existing ? JSON.parse(existing) : [];

		for (const tripUpdate of updates) {
			const index = merged.findIndex(tu => tu.trip.trip_id === tripUpdate.trip.trip_id);
			if (index >= 0) merged[index] = tripUpdate;
			else merged.push(tripUpdate);
		}

		await cacheDb.set(`hub:v1:realtime:eta:by-stop:${stopId}:gtfs`, JSON.stringify(merged), TTL_REALTIME);
	}));

	//
};
