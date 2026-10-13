/* * */

import { z } from 'zod';

import { RawVehicleEventBaseSchema } from '../../../raw-vehicle-event-base.js';

/* * */

const coordinateSchema = (limit: number) => z.string().trim().min(1).refine(value => Number.isFinite(Number(value)) && Math.abs(Number(value)) <= limit, 'Invalid coordinate');

export const RawVehicleEventPtCimatFlaviamobilV1PayloadSchema = z.object({
	departure_date: z.string(),
	destination: z.string(),
	direction: z.string(),
	fleet_number: z.string().trim().min(1),
	last_stop: z.string(),
	latitude: coordinateSchema(90),
	line_code: z.string(),
	longitude: coordinateSchema(180),
	origin: z.string(),
	position_date: z.string().regex(/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/),
	trip_id: z.string(),
});

export type RawVehicleEventPtCimatFlaviamobilV1Payload = z.infer<typeof RawVehicleEventPtCimatFlaviamobilV1PayloadSchema>;

export const RawVehicleEventPtCimatFlaviamobilV1Schema = RawVehicleEventBaseSchema.extend({
	payload: RawVehicleEventPtCimatFlaviamobilV1PayloadSchema,
	version: z.literal('pt-cimat-flaviamobil-v1'),
});

export type RawVehicleEventPtCimatFlaviamobilV1 = z.infer<typeof RawVehicleEventPtCimatFlaviamobilV1Schema>;
