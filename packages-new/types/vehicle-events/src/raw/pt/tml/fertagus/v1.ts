/* * */

import { RawVehicleEventBaseSchema } from '@/raw/raw-vehicle-event-base.js';
import { z } from 'zod';

/* * */

export const RawVehicleEventPtTmlFertagusV1PayloadSchema = z.object({
	date: z.string(),
	latitude: z.number().nullable().default(null),
	longitude: z.number().nullable().default(null),
	startsAt: z.string().nullable().default(null),
	stop_id_end: z.string().nullable().default(null),
	stop_id_start: z.string().nullable().default(null),
	train_id: z.number().nullable().default(null),
});

export type RawVehicleEventPtTmlFertagusV1Payload = z.infer<typeof RawVehicleEventPtTmlFertagusV1PayloadSchema>;

/* * */

export const RawVehicleEventPtTmlFertagusV1Schema = RawVehicleEventBaseSchema.extend({
	agency_id: z.literal('7NTB1'),
	payload: RawVehicleEventPtTmlFertagusV1PayloadSchema,
	version: z.literal('pt-tml-fertagus-v1'),
});

export type RawVehicleEventPtTmlFertagusV1 = z.infer<typeof RawVehicleEventPtTmlFertagusV1Schema>;
