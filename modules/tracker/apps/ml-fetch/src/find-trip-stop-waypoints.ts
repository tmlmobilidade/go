/* * */

import { type AggregationResult, type TrainNextStop, type TripStopWaypoint } from './types.js';

const gtfsTimeToSeconds = (time: string): number => {
	const [hours, minutes, seconds] = time.split(':').map(Number);
	return hours * 3600 + minutes * 60 + seconds;
};

/**
 * Locates the next-stop waypoint in the hashed trip path and its preceding stop, if any.
 */
export function findTripStopWaypoints({
	nextStop,
	ride,
}: {
	nextStop: TrainNextStop
	ride: AggregationResult
}): {
	nextStopWaypoint?: TripStopWaypoint
	previousStopWaypoint?: TripStopWaypoint
} {
	let previousStopWaypoint: TripStopWaypoint | undefined;
	let nextStopWaypoint: TripStopWaypoint | undefined;

	for (const [index, waypoint] of ride.hashed_trip.path.entries()) {
		const foundStopCode = waypoint.stop_codes.find(code => code === nextStop.stop_id);
		if (!foundStopCode) continue;

		if (index > 0) {
			const timeDifference = gtfsTimeToSeconds(waypoint.arrival_time) - gtfsTimeToSeconds(ride.hashed_trip.path[index - 1].departure_time);

			previousStopWaypoint = {
				latitude: ride.hashed_trip.path[index - 1].stop_lat,
				longitude: ride.hashed_trip.path[index - 1].stop_lon,
				stop_id: ride.hashed_trip.path[index - 1].stop_id,
				timeDifference,
			};

			nextStopWaypoint = {
				latitude: waypoint.stop_lat,
				longitude: waypoint.stop_lon,
				stop_id: waypoint.stop_id,
				timeDifference,
			};
		} else {
			nextStopWaypoint = {
				latitude: waypoint.stop_lat,
				longitude: waypoint.stop_lon,
				stop_id: waypoint.stop_id,
				timeDifference: 0,
			};
		}

		break;
	}

	return { nextStopWaypoint, previousStopWaypoint };
}
