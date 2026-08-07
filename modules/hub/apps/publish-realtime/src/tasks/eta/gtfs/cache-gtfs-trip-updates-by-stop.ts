/* * */

import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type GtfsRtTripUpdate } from '@tmlmobilidade/go-types-gtfs-rt';

/* * */

export async function cacheGtfsTripUpdatesByStop(tripUpdates: GtfsRtTripUpdate[]) {
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

		await cacheDb.set(`hub:v1:realtime:eta:by-stop:${stopId}:gtfs`, JSON.stringify(merged));
	}));

	//
};
