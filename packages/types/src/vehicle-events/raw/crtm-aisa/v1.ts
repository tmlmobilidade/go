/* * */

import { RawVehicleEventBaseSchema } from '@/vehicle-events/raw/raw-vehicle-event-base.js';
import { GtfsDateSchema, GtfsTimeSchema } from '@tmlmobilidade/go-types-gtfs';
import { GtfsRtCongestionLevelSchema, GtfsRtOccupancyStatusSchema, GtfsRtScheduleRelationshipSchema } from '@tmlmobilidade/go-types-gtfs-rt';
import { z } from 'zod';

/* * */

export const RawVehicleEventCrtmAisaV1PayloadSchema = z.object({
	header: z.object({
		feed_version: z.string().nullish(),
		gtfs_realtime_version: z.string(),
		incrementality: z.literal('FULL_DATASET').nullish(),
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

export type RawVehicleEventCrtmAisaV1Payload = z.infer<typeof RawVehicleEventCrtmAisaV1PayloadSchema>;

/* * */

export const RawVehicleEventCrtmAisaV1Schema = RawVehicleEventBaseSchema.extend({
	payload: RawVehicleEventCrtmAisaV1PayloadSchema,
	version: z.literal('crtm-aisa-v1'),
});

export type RawVehicleEventCrtmAisaV1 = z.infer<typeof RawVehicleEventCrtmAisaV1Schema>;
