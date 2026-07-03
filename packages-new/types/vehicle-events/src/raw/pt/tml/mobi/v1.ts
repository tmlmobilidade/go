/* * */

import { RawVehicleEventBaseSchema } from '@/raw/raw-vehicle-event-base.js';
import { GtfsDateSchema, GtfsTimeSchema } from '@tmlmobilidade/go-types-gtfs';
import { GtfsRtOccupancyStatusSchema, GtfsRtScheduleRelationshipSchema } from '@tmlmobilidade/go-types-gtfs-rt';
import { z } from 'zod';

/* * */

export const RawVehicleEventPtTmlMobiV1PayloadSchema = z.object({
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
			route_id: z.string(),
			schedule_relationship: GtfsRtScheduleRelationshipSchema.nullish(),
			start_date: GtfsDateSchema.nullish(),
			start_time: GtfsTimeSchema.nullish(),
			trip_id: z.string(),
		}),
		vehicle: z.object({
			id: z.string(),
		}),
	}),
});

export type RawVehicleEventPtTmlMobiV1Payload = z.infer<typeof RawVehicleEventPtTmlMobiV1PayloadSchema>;

/* * */

export const RawVehicleEventPtTmlMobiV1Schema = RawVehicleEventBaseSchema.extend({
	agency_id: z.literal('HF16N'),
	payload: RawVehicleEventPtTmlMobiV1PayloadSchema,
	version: z.literal('pt-tml-mobi-v1'),
});

export type RawVehicleEventPtTmlMobiV1 = z.infer<typeof RawVehicleEventPtTmlMobiV1Schema>;
