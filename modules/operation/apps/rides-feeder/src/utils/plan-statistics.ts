/* * */

import { type PlanStatistics, PlanStatisticsSchema, type Ride } from '@tmlmobilidade/go-types-operation';

/* * */

/** Reuses the feeder's ride IDs so retries and repeated GTFS rows count once. */
export function createPlanStatisticsAccumulator(rideIds: Set<string>) {
	const lineIds = new Set<string>();
	let distanceMeters = 0;
	let complete = true;

	return {
		add(ride: Pick<Ride, '_id' | 'agency_id' | 'extension_scheduled' | 'route_short_name'>) {
			if (rideIds.has(ride._id)) return;
			rideIds.add(ride._id);
			if (!ride.route_short_name?.trim()) complete = false;
			lineIds.add(JSON.stringify([ride.agency_id, ride.route_short_name]));
			distanceMeters += ride.extension_scheduled;
		},
		invalidate() {
			complete = false;
		},
		result(): null | PlanStatistics {
			if (!complete) return null;
			const parsed = PlanStatisticsSchema.safeParse({
				distance_meters: distanceMeters,
				line_count: lineIds.size,
				trip_count: rideIds.size,
			});
			return parsed.success ? parsed.data : null;
		},
	};
}
