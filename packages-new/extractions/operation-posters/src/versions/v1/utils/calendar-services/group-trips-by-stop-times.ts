/* * */

import { type GtfsStrictV30StopTimes, type GtfsStrictV30Trips } from '@tmlmobilidade/go-types-gtfs-strict';

import { type TripGroup } from '../../types/interfaces.js';

/* * */

export async function groupTripsByStopTimes(trips: GtfsStrictV30Trips[], getStopTimes: (tripId: string) => GtfsStrictV30StopTimes[], onTripRead: () => Promise<void>): Promise<TripGroup[]> {
	//

	//
	// A. Prepare groups for trips with identical stop times

	const groups = new Map<string, TripGroup>();

	//
	// B. Read ordered stop times and collect matching trips and services

	for (const trip of trips) {
		await onTripRead();
		const stopTimes = getStopTimes(trip.trip_id);
		if (!stopTimes.length) continue;
		// Ignore trip IDs so identical schedules can share their service dates.
		const key = stopTimes.map(stopTime => JSON.stringify({ ...stopTime, trip_id: null })).join('|');
		let group = groups.get(key);
		if (!group) {
			group = { serviceIds: new Set(), startTime: stopTimes[0].arrival_time.slice(0, 5).replaceAll(':', ''), stopTimes, trip, tripIds: [] };
			groups.set(key, group);
		}
		group.tripIds.push(trip.trip_id);
		group.serviceIds.add(trip.service_id);
	}
	return [...groups.values()];
}
