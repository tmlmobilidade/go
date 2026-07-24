/* * */

import { z } from 'zod';

import { RawVehicleEventPtTmpUnirV1Schema } from './v1.js';

/* * */

export const RawVehicleEventPtTmpUnirSchema = z.discriminatedUnion('version', [
	RawVehicleEventPtTmpUnirV1Schema,
]);

export type RawVehicleEventPtTmpUnir = z.infer<typeof RawVehicleEventPtTmpUnirSchema>;
