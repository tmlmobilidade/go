/* * */

import { GtfsRtOccupancyStatusSchema } from '@/gtfs-rt/occupancy-status.js';
import { RawVehicleEventBaseSchema } from '@/vehicle-events/raw/raw-vehicle-event-base.js';
import { z } from 'zod';

/* * */

export const RawVehicleEventPayloadCapV1Schema = z.object({
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
			label: z.string(),
		}),
	}),
});

export type RawVehicleEventPayloadCapV1 = z.infer<typeof RawVehicleEventPayloadCapV1Schema>;

/* * */

export const RawVehicleEventCapV1Schema = RawVehicleEventBaseSchema.extend({
	payload: RawVehicleEventPayloadCapV1Schema,
	version: z.literal('cap-v1'),
});

export type RawVehicleEventCapV1 = z.infer<typeof RawVehicleEventCapV1Schema>;
