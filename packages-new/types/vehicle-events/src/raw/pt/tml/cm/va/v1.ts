/* * */

import { RawVehicleEventBaseSchema } from '@/raw/raw-vehicle-event-base.js';
import { z } from 'zod';

/* * */

export const RawVehicleEventPtTmlCmVaV1PayloadSchema = z.object({
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

export type RawVehicleEventPtTmlCmVaV1Payload = z.infer<typeof RawVehicleEventPtTmlCmVaV1PayloadSchema>;

/* * */

export const RawVehicleEventPtTmlCmVaV1Schema = RawVehicleEventBaseSchema.extend({
	agency_id: z.literal('LA77N'),
	payload: RawVehicleEventPtTmlCmVaV1PayloadSchema,
	version: z.literal('pt-tml-cm-va-v1'),
});

export type RawVehicleEventPtTmlCmVaV1 = z.infer<typeof RawVehicleEventPtTmlCmVaV1Schema>;
