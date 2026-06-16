import type { HistoricalRide } from '@/process/rides-query.js';

import { Ride } from '@tmlmobilidade/types';

export function parseHistoricalRide(ride: HistoricalRide) {
	return {
		_id: ride._id,
		agency_id: ride.agency_id,
		end_time_observed: ride.end_time_observed,
		first_stop: ride.first_stop,
		first_stop_coordinates: [ride.first_stop.stop_lat, ride.first_stop.stop_lon],
		first_stop_id: ride.first_stop.stop_id,
		first_stop_name: ride.first_stop.stop_name,
		hashed_shape_id: ride.hashed_shape_id,
		hashed_trip_id: ride.hashed_trip_id,
		last_stop: ride.last_stop,
		last_stop_coordinates: [ride.last_stop.stop_lat, ride.last_stop.stop_lon],
		last_stop_id: ride.last_stop.stop_id,
		last_stop_name: ride.last_stop.stop_name,
		plan_id: ride.plan_id,
		start_time_observed: ride.start_time_observed,
		start_time_scheduled: ride.start_time_scheduled,
		trip_id: ride.trip_id,
	};
}

export function parseRide(ride: Ride) {
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

export type EtaRideRow = ReturnType<typeof parseRide>;
