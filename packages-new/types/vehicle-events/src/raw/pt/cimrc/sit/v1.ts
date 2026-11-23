/* * */

import { RawVehicleEventBaseSchema } from '@/raw/raw-vehicle-event-base.js';
import { z } from 'zod';

/* * */

export const RawVehicleEventPtCimrcSitV1PayloadSchema = z.object({
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

export type RawVehicleEventPtCimrcSitV1Payload = z.infer<typeof RawVehicleEventPtCimrcSitV1PayloadSchema>;

export const RawVehicleEventPtCimrcSitV1Schema = RawVehicleEventBaseSchema.extend({
	agency_id: z.literal('NHW3B'),
	payload: RawVehicleEventPtCimrcSitV1PayloadSchema,
	version: z.literal('pt-cimrc-sit-v1'),
});

export type RawVehicleEventPtCimrcSitV1 = z.infer<typeof RawVehicleEventPtCimrcSitV1Schema>;
