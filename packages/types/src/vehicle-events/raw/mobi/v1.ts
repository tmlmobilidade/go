/* * */

import { GtfsRtOccupancyStatusSchema } from '@/gtfs-rt/occupancy-status.js';
import { OperationalDateSchema } from '@/index.js';
import { RawVehicleEventBaseSchema } from '@/vehicle-events/raw/raw-vehicle-event-base.js';
import { z } from 'zod';

/* * */

export const RawVehicleEventMobiV1PayloadSchema = z.object({
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
			schedule_relationship: z.enum(['SCHEDULED', 'NOT_SCHEDULED']).nullish(),
			start_time: OperationalDateSchema.nullish(),
			trip_id: z.string(),
		}),
		vehicle: z.object({
			id: z.string(),
		}),
	}),
});

export type RawVehicleEventMobiV1Payload = z.infer<typeof RawVehicleEventMobiV1PayloadSchema>;

/* * */

export const RawVehicleEventMobiV1Schema = RawVehicleEventBaseSchema.extend({
	payload: RawVehicleEventMobiV1PayloadSchema,
	version: z.literal('mobi-v1'),
});

export type RawVehicleEventMobiV1 = z.infer<typeof RawVehicleEventMobiV1Schema>;
