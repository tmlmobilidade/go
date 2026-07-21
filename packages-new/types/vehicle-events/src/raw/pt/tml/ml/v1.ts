/* * */

import { RawVehicleEventBaseSchema } from '@/raw/raw-vehicle-event-base.js';
import { z } from 'zod';

/* * */

export const RawVehicleEventPtTmlMlV1PayloadSchema = z.object({
	header: z.object({
		gtfs_realtime_version: z.string(),
		incrementality: z.literal('FULL_DATASET'),
		timestamp: z.number(),
	}),
	vehicle: z.object({
		bearing: z.number().nullish(),
		current_status: z.enum(['INCOMING_AT', 'STOPPED_AT', 'IN_TRANSIT_TO']).nullish(),
		position: z.object({
			latitude: z.number(),
			longitude: z.number(),
		}),
		speed: z.number().nullish(),
		stop_id: z.string().nullish(),
		timestamp: z.number().nullish(),
		trip: z.object({
			trip_id: z.string(),
		}),
		vehicle: z.object({
			id: z.string(),
		}),
	}),
});

export type RawVehicleEventPtTmlMlV1Payload = z.infer<typeof RawVehicleEventPtTmlMlV1PayloadSchema>;

export const RawVehicleEventPtTmlMlV1Schema = RawVehicleEventBaseSchema.extend({
	agency_id: z.literal('IA2N9'),
	payload: RawVehicleEventPtTmlMlV1PayloadSchema,
	version: z.literal('pt-tml-ml-v1'),
});

export type RawVehicleEventPtTmlMlV1 = z.infer<typeof RawVehicleEventPtTmlMlV1Schema>;
