/* * */

import { RawVehicleEventBaseSchema } from '@/raw/raw-vehicle-event-base.js';
import { z } from 'zod';

/* * */

export const RawVehicleEventPtTmlCmRlV1PayloadSchema = z.object({
	header: z.object({
		gtfsRealtimeVersion: z.string(),
		incrementality: z.string(),
		timestamp: z.number(),
	}),
	vehicle: z.object({
		agencyId: z.string(),
		currentStatus: z.string(),
		occupancyStatus: z.string(),
		operationPlanId: z.string(),
		position: z.object({
			bearing: z.number().optional(),
			latitude: z.number(),
			longitude: z.number(),
			odometer: z.number().optional(),
			speed: z.number().optional(),
		}),
		stopId: z.string().optional(),
		timestamp: z.number(),
		trigger: z.object({
			activity: z.string().optional(),
			door: z.string().optional(),
		}),
		trip: z.object({
			extraTripId: z.string().optional(),
			lineId: z.string(),
			patternId: z.string(),
			routeId: z.string(),
			scheduleRelationship: z.string(),
			tripId: z.string(),
		}),
		vehicle: z.object({
			_id: z.string(),
			blockId: z.string().optional(),
			driverId: z.string(),
			shiftId: z.string().optional(),
		}),
	}),
});

export type RawVehicleEventPtTmlCmRlV1Payload = z.infer<typeof RawVehicleEventPtTmlCmRlV1PayloadSchema>;

/* * */

export const RawVehicleEventPtTmlCmRlV1Schema = RawVehicleEventBaseSchema.extend({
	agency_id: z.literal('BNA17'),
	payload: RawVehicleEventPtTmlCmRlV1PayloadSchema,
	version: z.literal('pt-tml-cm-rl-v1'),
});

export type RawVehicleEventPtTmlCmRlV1 = z.infer<typeof RawVehicleEventPtTmlCmRlV1Schema>;
