/* * */

import { RawVehicleEventBaseSchema } from '@/raw/raw-vehicle-event-base.js';
import { z } from 'zod';

/* * */

export const RawVehicleEventPtTmlCmAlsaV1PayloadSchema = z.object({
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

export type RawVehicleEventPtTmlCmAlsaV1Payload = z.infer<typeof RawVehicleEventPtTmlCmAlsaV1PayloadSchema>;

/* * */

export const RawVehicleEventPtTmlCmAlsaV1Schema = RawVehicleEventBaseSchema.extend({
	agency_id: z.literal('A2L1N'),
	payload: RawVehicleEventPtTmlCmAlsaV1PayloadSchema,
	version: z.literal('pt-tml-cm-alsa-v1'),
});

export type RawVehicleEventPtTmlCmAlsaV1 = z.infer<typeof RawVehicleEventPtTmlCmAlsaV1Schema>;
