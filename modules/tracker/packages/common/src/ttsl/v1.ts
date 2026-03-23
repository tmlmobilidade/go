/* * */

import { TrackerVehicleEventBaseSchema } from '@/common/vehicle-event-base.js';
import { GtfsRtOccupancyStatusSchema, type SimplifiedVehicleEvent } from '@tmlmobilidade/types';
import { z } from 'zod';

/* * */

export const TrackerTtslV1RawSchema = z.object({
	header: z.object({
		feed_version: z.string().nullish(),
		gtfs_realtime_version: z.string(),
		incrementality: z.literal('FULL_DATASET'),
		timestamp: z.number(),
	}),
	vehicle: z.object({
		current_status: z.enum(['INCOMING_AT', 'STOPPED_AT', 'IN_TRANSIT_TO']).nullish(),
		occupancy_status: GtfsRtOccupancyStatusSchema.nullish(),
		position: z.object({
			bearing: z.number().nullish(),
			latitude: z.number(),
			longitude: z.number(),
			speed: z.number().nullish(),
		}),
		stop_id: z.string().nullish(),
		timestamp: z.number().nullish(),
		trip: z.object({
			trip_id: z.string(),
		}),
		vehicle: z.object({
			id: z.string(),
			label: z.string(),
		}),
	}),
});

export type TrackerTtslV1Raw = z.infer<typeof TrackerTtslV1RawSchema>;

/* * */

export const TrackerTtslV1Schema = TrackerVehicleEventBaseSchema.extend({
	raw: TrackerTtslV1RawSchema,
	version: z.literal('ttsl-v1'),
});

export type TrackerTtslV1 = z.infer<typeof TrackerTtslV1Schema>;

/* * */

export const parseTrackerTtslV1 = (vehicleEvent: TrackerTtslV1): SimplifiedVehicleEvent => {
	const vehicle = vehicleEvent.raw.vehicle;

	return {
		_id: vehicleEvent._id,
		agency_id: vehicleEvent.agency_id,
		bearing: vehicle.position.bearing ?? null,
		created_at: vehicleEvent.created_at,
		current_status: vehicle.current_status ?? null,
		door: null,
		driver_id: null,
		extra_trip_id: null,
		latitude: vehicle.position.latitude,
		longitude: vehicle.position.longitude,
		odometer: null,
		pattern_id: null,
		received_at: vehicleEvent.received_at,
		speed: vehicle.position.speed ?? null,
		stop_id: vehicle.stop_id ?? null,
		trip_id: vehicle.trip.trip_id,
		vehicle_id: vehicle.vehicle.id,
	};
};
