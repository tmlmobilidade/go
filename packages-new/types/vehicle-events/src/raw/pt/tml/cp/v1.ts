/* * */

import { RawVehicleEventBaseSchema } from '@/raw/raw-vehicle-event-base.js';
import { GtfsRtOccupancyStatusSchema, GtfsRtScheduleRelationshipSchema } from '@tmlmobilidade/go-types-gtfs-rt';
import { z } from 'zod';

/* * */

export const RawVehicleEventPtTmlCpV1PayloadSchema = z.object({
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
		}),
		timestamp: z.number().nullish(),
		trip: z.object({
			schedule_relationship: GtfsRtScheduleRelationshipSchema.nullish(),
			trip_id: z.string(),
		}),
		vehicle: z.object({
			id: z.string(),
		}),
	}),
});

export type RawVehicleEventPtTmlCpV1Payload = z.infer<typeof RawVehicleEventPtTmlCpV1PayloadSchema>;

/* * */

export const RawVehicleEventPtTmlCpV1Schema = RawVehicleEventBaseSchema.extend({
	payload: RawVehicleEventPtTmlCpV1PayloadSchema,
	version: z.literal('pt-tml-cp-v1'),
});

export type RawVehicleEventPtTmlCpV1 = z.infer<typeof RawVehicleEventPtTmlCpV1Schema>;
