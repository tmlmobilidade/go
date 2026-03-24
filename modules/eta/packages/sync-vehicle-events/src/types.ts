import { Ride } from '@tmlmobilidade/types';

export interface EtaVehicleEvent {
	_id: string
	agency_id: string
	created_at: number
	hashed_shape_id: string
	latitude: number
	line_id: number
	longitude: number
	ride_id: string
	vehicle_id: string
}

export const rideProjection: Partial<Record<keyof Ride, 0 | 1>> = {
	_id: 1,
	end_time_observed: 1,
	hashed_shape_id: 1,
	line_id: 1,
	operational_date: 1,
	start_time_observed: 1,
	start_time_scheduled: 1,
	trip_id: 1,
};
