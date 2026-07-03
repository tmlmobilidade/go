/* * */

import { RawVehicleEventBaseSchema } from '@/raw/raw-vehicle-event-base.js';
import { GtfsRtOccupancyStatusSchema } from '@tmlmobilidade/go-types-gtfs-rt';
import { z } from 'zod';

/* * */

export const RawVehicleEventPtTmlTtslV1PayloadSchema = z.object({
	header: z.object({
		feed_version: z.string().nullish(),
		gtfs_realtime_version: z.string(),
		incrementality: z.literal('FULL_DATASET'),
		timestamp: z.number(),
	}),
	vehicle: z.object({
		current_status: z.enum(['INCOMING_AT', 'STOPPED_AT', 'IN_TRANSIT_TO']).nullish(),
		occupancy_status: GtfsRtOccupancyStatusSchema.nullish(),
		position: z.object({
			bearing: z.number().nullish(),
			latitude: z.number(),
			longitude: z.number(),
			speed: z.number().nullish(),
		}),
		stop_id: z.string().nullish(),
		timestamp: z.number().nullish(),
		trip: z.object({
			trip_id: z.string(),
		}),
		vehicle: z.object({
			id: z.string(),
			label: z.string().nullish(),
		}),
	}),
});

export type RawVehicleEventPtTmlTtslV1Payload = z.infer<typeof RawVehicleEventPtTmlTtslV1PayloadSchema>;

/* * */

export const RawVehicleEventPtTmlTtslV1Schema = RawVehicleEventBaseSchema.extend({
	payload: RawVehicleEventPtTmlTtslV1PayloadSchema,
	version: z.literal('pt-tml-ttsl-v1'),
});

export type RawVehicleEventPtTmlTtslV1 = z.infer<typeof RawVehicleEventPtTmlTtslV1Schema>;
