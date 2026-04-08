/* * */
;
import { RawVehicleEventBaseSchema } from '@/vehicle-events/raw/raw-vehicle-event-base.js';
import { z } from 'zod';

/* * */

export const RawVehicleEventCmetV1CorePayloadSchema = z.object({
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

export type RawVehicleEventCmetV1CorePayload = z.infer<typeof RawVehicleEventCmetV1CorePayloadSchema>;

/* * */

export const RawVehicleEventCmetV1CoreSchema = RawVehicleEventBaseSchema.extend({
	payload: RawVehicleEventCmetV1CorePayloadSchema,
	version: z.literal('cmet-v1-core'),
});

export type RawVehicleEventCmetV1Core = z.infer<typeof RawVehicleEventCmetV1CoreSchema>;
