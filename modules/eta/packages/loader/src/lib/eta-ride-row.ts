import type { Ride } from '@tmlmobilidade/types';

export function toEtaRideRow(ride: Ride) {
	return {
		_id: ride._id,
		end_time_observed: ride.end_time_observed,
		hashed_shape_id: ride.hashed_shape_id,
		hashed_trip_id: ride.hashed_trip_id,
		start_time_observed: ride.start_time_observed,
		start_time_scheduled: ride.start_time_scheduled,
		trip_id: ride.trip_id,
	};
}

export type EtaRideRow = ReturnType<typeof toEtaRideRow>;
