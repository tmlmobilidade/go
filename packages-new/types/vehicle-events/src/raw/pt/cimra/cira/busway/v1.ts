/* * */

import { RawVehicleEventBaseSchema } from '@/raw/raw-vehicle-event-base.js';
import { z } from 'zod';

/* * */

export const RawVehicleEventPtCimraCiraBuswayV1PayloadSchema = z.object({
	header: z.object({
		feed_version: z.string().nullish(),
		gtfs_realtime_version: z.string(),
		incrementality: z.string().nullish(),
		timestamp: z.number().nullish(),
	}),
	vehicle: z.object({
		current_status: z.enum(['INCOMING_AT', 'STOPPED_AT', 'IN_TRANSIT_TO']).nullish(),
		position: z.object({
			bearing: z.number().nullish(),
			latitude: z.number(),
			longitude: z.number(),
			odometer: z.number().nullish(),
			speed: z.number().nullish(),
		}),
		stop_id: z.string().nullish(),
		timestamp: z.number().nullish(),
		trip: z.object({ trip_id: z.string().min(1) }),
		vehicle: z.object({ id: z.string().min(1) }),
	}),
});

export type RawVehicleEventPtCimraCiraBuswayV1Payload = z.infer<typeof RawVehicleEventPtCimraCiraBuswayV1PayloadSchema>;

export const RawVehicleEventPtCimraCiraBuswayV1Schema = RawVehicleEventBaseSchema.extend({
	agency_id: z.literal('6QI7P'),
	payload: RawVehicleEventPtCimraCiraBuswayV1PayloadSchema,
	version: z.literal('pt-cimra-cira-busway-v1'),
});

export type RawVehicleEventPtCimraCiraBuswayV1 = z.infer<typeof RawVehicleEventPtCimraCiraBuswayV1Schema>;
