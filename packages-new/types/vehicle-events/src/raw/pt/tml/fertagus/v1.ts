/* * */

import { RawVehicleEventBaseSchema } from '@/raw/raw-vehicle-event-base.js';
import { UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RawVehicleEventPtTmlFertagusV1PayloadSchema = z.object({
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

export type RawVehicleEventPtTmlFertagusV1Payload = z.infer<typeof RawVehicleEventPtTmlFertagusV1PayloadSchema>;

/* * */

export const RawVehicleEventPtTmlFertagusV1Schema = RawVehicleEventBaseSchema.extend({
	payload: RawVehicleEventPtTmlFertagusV1PayloadSchema,
	version: z.literal('pt-tml-fertagus-v1'),
});

export type RawVehicleEventPtTmlFertagusV1 = z.infer<typeof RawVehicleEventPtTmlFertagusV1Schema>;
