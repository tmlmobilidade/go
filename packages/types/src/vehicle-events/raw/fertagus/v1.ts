/* * */
;
import { UnixTimestampSchema } from '@/index.js';
import { RawVehicleEventBaseSchema } from '@/vehicle-events/raw/raw-vehicle-event-base.js';
import { z } from 'zod';

/* * */

export const RawVehicleEventFertagusV1PayloadSchema = z.object({
	header: z.object({
		gtfs_realtime_version: z.literal('2.0'),
		incrementality: z.literal('FULL_DATASET'),
		timestamp: UnixTimestampSchema,
	}),
	vehicle: z.object({
		agencyId: z.string(),
		current_status: z.literal('IN_TRANSIT_TO'),
		position: z.object({
			latitude: z.number(),
			longitude: z.number(),
		}),
		timestamp: z.number(),
		trip: z.object({
			line_id: z.string(),
			pattern_id: z.string(),
			route_id: z.string(),
			schedule_relationship: z.literal('SCHEDULED'),
			trip_id: z.string(),
		}),
		vehicle: z.object({
			id: z.string(),
		}),
	}),
});

export type RawVehicleEventFertagusV1Payload = z.infer<typeof RawVehicleEventFertagusV1PayloadSchema>;

/* * */

export const RawVehicleEventFertagusV1Schema = RawVehicleEventBaseSchema.extend({
	payload: RawVehicleEventFertagusV1PayloadSchema,
	version: z.literal('fertagus-v1'),
});

export type RawVehicleEventFertagusV1 = z.infer<typeof RawVehicleEventFertagusV1Schema>;
