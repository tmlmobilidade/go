/* * */

import {
	GtfsRtOccupancyStatusSchema,
	GtfsRtPositionSchema,
	GtfsRtVehicleDescriptorSchema,
	GtfsRtVehicleStopStatusSchema,
} from '@/gtfs-rt/index.js';
import { RawVehicleEventBaseSchema } from '@/vehicle-events/raw/raw-vehicle-event-base.js';
import { z } from 'zod';

/* * */

export const RawVehicleEventCrtmLaVelozV1PayloadSchema = z.object({
	header: z.object({
		feed_version: z.string().nullish(),
		gtfs_realtime_version: z.string(),
		incrementality: z.literal('FULL_DATASET'),
		timestamp: z.number(),
	}),
	vehicle: z.object({
		current_status: GtfsRtVehicleStopStatusSchema.nullish(),
		occupancy_status: GtfsRtOccupancyStatusSchema.nullish(),
		position: GtfsRtPositionSchema,
		stop_id: z.string().nullish(),
		timestamp: z.number().nullish(),
		trip: z.object({
			route_id: z.string().nullish(),
			schedule_relationship: z.enum(['SCHEDULED', 'ADDED', 'UNSCHEDULED', 'CANCELED']).nullish(),
			start_date: z.string().nullish(),
			trip_id: z.string(),
		}),
		vehicle: GtfsRtVehicleDescriptorSchema,
	}),
});

export type RawVehicleEventCrtmLaVelozV1Payload = z.infer<typeof RawVehicleEventCrtmLaVelozV1PayloadSchema>;

/* * */

export const RawVehicleEventCrtmLaVelozV1Schema = RawVehicleEventBaseSchema.extend({
	payload: RawVehicleEventCrtmLaVelozV1PayloadSchema,
	version: z.literal('crtm-laveloz-v1'),
});

export type RawVehicleEventCrtmLaVelozV1 = z.infer<typeof RawVehicleEventCrtmLaVelozV1Schema>;
