/* * */

import { GtfsRtOccupancyStatusSchema } from '@/gtfs-rt/occupancy-status.js';
import { RawVehicleEventBaseSchema } from '@/vehicle-events/raw/raw-vehicle-event-base.js';
import { type SimplifiedVehicleEvent } from '@/vehicle-events/simplified/simplified-vehicle-event.js';
import { z } from 'zod';

/* * */

export const RawVehicleEventPayloadTtslV1Schema = z.object({
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

export type RawVehicleEventPayloadTtslV1 = z.infer<typeof RawVehicleEventPayloadTtslV1Schema>;

/* * */

export const RawVehicleEventTtslV1Schema = RawVehicleEventBaseSchema.extend({
	payload: RawVehicleEventPayloadTtslV1Schema,
	version: z.literal('ttsl-v1'),
});

export type RawVehicleEventTtslV1 = z.infer<typeof RawVehicleEventTtslV1Schema>;

/* * */

export const parseRawVehicleEventTtslV1 = (doc: RawVehicleEventTtslV1): SimplifiedVehicleEvent => {
	const vehicle = doc.payload.vehicle;
	return {
		_id: doc._id,
		agency_id: doc.agency_id,
		bearing: vehicle.position.bearing ?? null,
		created_at: doc.created_at,
		current_status: vehicle.current_status ?? null,
		door: null,
		driver_id: null,
		extra_trip_id: null,
		latitude: vehicle.position.latitude,
		longitude: vehicle.position.longitude,
		odometer: null,
		pattern_id: null,
		received_at: doc.received_at,
		speed: vehicle.position.speed ?? null,
		stop_id: vehicle.stop_id ?? null,
		trip_id: vehicle.trip.trip_id,
		vehicle_id: vehicle.vehicle.id,
	};
};
