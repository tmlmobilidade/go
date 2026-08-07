/* * */

import { RawVehicleEventBaseSchema } from '@/raw/raw-vehicle-event-base.js';
import { GtfsDateSchema, GtfsTimeSchema } from '@tmlmobilidade/go-types-gtfs';
import { GtfsRtCongestionLevelSchema, GtfsRtOccupancyStatusSchema, GtfsRtScheduleRelationshipSchema } from '@tmlmobilidade/go-types-gtfs-rt';
import { z } from 'zod';

/* * */

export const RawVehicleEventEsCrtmLaVelozV1PayloadSchema = z.object({
	header: z.object({
		feed_version: z.string().nullish(),
		gtfs_realtime_version: z.string(),
		incrementality: z.literal('FULL_DATASET'),
		timestamp: z.number(),
	}),
	vehicle: z.object({
		congestion_level: GtfsRtCongestionLevelSchema.nullish(),
		current_status: z.enum(['INCOMING_AT', 'STOPPED_AT', 'IN_TRANSIT_TO']).nullish(),
		current_stop_sequence: z.number().nullish(),
		occupancy_status: GtfsRtOccupancyStatusSchema.nullish(),
		position: z.object({
			bearing: z.number().nullish(),
			latitude: z.number(),
			longitude: z.number(),
			odometer: z.number().nullish(),
			speed: z.number().nullish(),
		}),
		stop_id: z.string().nullish(),
		timestamp: z.number().nullish(),
		trip: z.object({
			direction_id: z.number().nullish(),
			route_id: z.string(),
			schedule_relationship: GtfsRtScheduleRelationshipSchema.nullish(),
			start_date: GtfsDateSchema.nullish(),
			start_time: GtfsTimeSchema.nullish(),
			trip_id: z.string(),
		}),
		vehicle: z.object({
			id: z.string(),
			label: z.string().nullish(),
		}),
	}),
});

export type RawVehicleEventEsCrtmLaVelozV1Payload = z.infer<typeof RawVehicleEventEsCrtmLaVelozV1PayloadSchema>;

/* * */

export const RawVehicleEventEsCrtmLaVelozV1Schema = RawVehicleEventBaseSchema.extend({
	agency_id: z.literal('DFS5M'),
	payload: RawVehicleEventEsCrtmLaVelozV1PayloadSchema,
	version: z.literal('es-crtm-la-veloz-v1'),
});

export type RawVehicleEventEsCrtmLaVelozV1 = z.infer<typeof RawVehicleEventEsCrtmLaVelozV1Schema>;
