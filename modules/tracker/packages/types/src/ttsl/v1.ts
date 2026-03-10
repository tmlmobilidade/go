/* * */

import { TrackerVehicleEventBaseSchema } from '@/common/vehicle-event-base.js';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/types';
import { z } from 'zod';

/* * */

export const TrackerTtslV1RawSchema = z.object({
	header: z.object({
		gtfsRealtimeVersion: z.literal('2.0'),
		incrementality: z.literal('DIFFERENTIAL'),
		timestamp: z.number(),
	}),
	vehicle: z.object({
		currentStatus: z.enum(['INCOMING_AT', 'STOPPED_AT', 'IN_TRANSIT_TO']),
		occupancyStatus: z.enum(['EMPTY', 'PARTIALLY_OCCUPIED', 'FULL']),
		position: z.object({
			bearing: z.number(),
			latitude: z.number(),
			longitude: z.number(),
			speed: z.number(),
		}),
		stopId: z.string(),
		timestamp: z.number(),
		trip: z.object({
			tripId: z.string(),
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

export const parseTrackerTtslV1Schema = (vehicleEvent: TrackerTtslV1): SimplifiedVehicleEvent => {
	const vehicle = vehicleEvent.raw.vehicle;

	return {
		_id: vehicleEvent._id,
		agency_id: vehicleEvent.agency_id,
		bearing: vehicle.position.bearing,
		created_at: vehicleEvent.created_at,
		current_status: vehicle.currentStatus,
		door: null,
		driver_id: vehicle.vehicle.label,
		extra_trip_id: null,
		latitude: vehicle.position.latitude,
		longitude: vehicle.position.longitude,
		odometer: null,
		pattern_id: null,
		received_at: vehicleEvent.received_at,
		speed: vehicle.position.speed,
		stop_id: vehicle.stopId,
		trip_id: vehicle.trip.tripId,
		vehicle_id: vehicle.vehicle.id,
	};
};
