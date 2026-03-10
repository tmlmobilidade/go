/* * */

import { z } from 'zod';

import { TrackerVehicleEventBaseSchema } from './vehicle-event-base.js';

/* * */

export const TrackerCmetV1RawSchema = z.object({
	currentStatus: z.enum(['INCOMING_AT', 'STOPPED_AT', 'IN_TRANSIT_TO']),
	occupancyStatus: z.enum(['EMPTY', 'PARTIALLY_OCCUPIED', 'FULL']),
	position: z.object({
		bearing: z.number(),
		latitude: z.number(),
		longitude: z.number(),
		speed: z.number(),
	}),
	stopId: z.string(),
	timestamp: z.number(),
	trip: z.object({
		tripId: z.string(),
	}),
	vehicle: z.object({
		id: z.string(),
		label: z.string(),
	}),
});

export type TrackerCmetV1Raw = z.infer<typeof TrackerCmetV1RawSchema>;

/* * */

export const TrackerCmetV1Schema = TrackerVehicleEventBaseSchema.extend({
	raw: TrackerCmetV1RawSchema,
	version: z.literal('Cmet-v1'),
});
