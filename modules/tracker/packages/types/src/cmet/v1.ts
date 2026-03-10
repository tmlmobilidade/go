/* * */

import { TrackerVehicleEventBaseSchema } from '@/common/vehicle-event-base.js';
import { SimplifiedVehicleEvent } from '@tmlmobilidade/types';
import { z } from 'zod';

/* * */

export const TrackerCmetV1RawSchema = z.object({
	header: z.object({
		gtfsRealtimeVersion: z.literal('2.0'),
		incrementality: z.literal('DIFFERENTIAL'),
		timestamp: z.number(),
	}),
	vehicle: z.object({
		agencyId: z.string(),
		currentStatus: z.enum(['INCOMING_AT', 'STOPPED_AT', 'IN_TRANSIT_TO']),
		occupancyStatus: z.enum(['EMPTY', 'PARTIALLY_OCCUPIED', 'FULL']),
		operationPlanId: z.string(),
		position: z.object({
			bearing: z.number(),
			latitude: z.number(),
			longitude: z.number(),
			odometer: z.number(),
			speed: z.number(),
		}),
		stopId: z.string(),
		timestamp: z.number(),
		trigger: z.object({
			activity: z.enum(['NO_CHANGE', 'CHANGE']),
			door: z.enum(['NO_CHANGE', 'CHANGE']),
		}),
		trip: z.object({
			extraTripId: z.string(),
			lineId: z.string(),
			patternId: z.string(),
			routeId: z.string(),
			scheduleRelationship: z.enum(['SCHEDULED', 'NOT_SCHEDULED']),
			tripId: z.string(),
		}),
		vehicle: z.object({
			_id: z.string(),
			blockId: z.string(),
			driverId: z.string(),
			shiftId: z.string(),
		}),
	}),
});

export type TrackerCmetV1Raw = z.infer<typeof TrackerCmetV1RawSchema>;

/* * */

export const TrackerCmetV1Schema = TrackerVehicleEventBaseSchema.extend({
	raw: TrackerCmetV1RawSchema,
	version: z.literal('cmet-v1'),
});

export type TrackerCmetV1 = z.infer<typeof TrackerCmetV1Schema>;

/* * */
export const parseTrackerCmetV1 = (vehicleEvent: TrackerCmetV1): SimplifiedVehicleEvent => {
	const vehicle = vehicleEvent.raw.vehicle;

	return {
		_id: vehicleEvent._id,
		agency_id: vehicleEvent.agency_id,
		bearing: vehicle.position.bearing,
		created_at: vehicleEvent.created_at,
		current_status: vehicle.currentStatus,
		door: vehicle.trigger.door,
		driver_id: vehicle.vehicle.driverId,
		extra_trip_id: vehicle.trip?.extraTripId,
		latitude: vehicle.position.latitude,
		longitude: vehicle.position.longitude,
		odometer: vehicle.position.odometer,
		pattern_id: vehicle.trip?.patternId,
		received_at: vehicleEvent.received_at,
		speed: vehicle.position.speed,
		stop_id: vehicle.stopId,
		trip_id: vehicle.trip?.tripId,
		vehicle_id: vehicle.vehicle._id,
	};
};
