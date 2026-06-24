import { RawVehicleEventBaseSchema } from '@/vehicle-events/raw/raw-vehicle-event-base.js';
import { z } from 'zod';

export const RawVehicleEventMlV1PayloadSchema = z.object({
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

export type RawVehicleEventMlV1Payload = z.infer<typeof RawVehicleEventMlV1PayloadSchema>;

export const RawVehicleEventMlV1Schema = RawVehicleEventBaseSchema.extend({
	payload: RawVehicleEventMlV1PayloadSchema,
	version: z.literal('ml-v1'),
});

export type RawVehicleEventMlV1 = z.infer<typeof RawVehicleEventMlV1Schema>;
