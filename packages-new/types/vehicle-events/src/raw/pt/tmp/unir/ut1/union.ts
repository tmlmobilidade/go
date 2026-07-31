/* * */

import { z } from 'zod';

import { RawVehicleEventPtTmpUnirUt1V1Schema } from './v1.js';

/* * */

export const RawVehicleEventPtTmpUnirUt1Schema = z.discriminatedUnion('version', [
	RawVehicleEventPtTmpUnirUt1V1Schema,
]);

export type RawVehicleEventPtTmpUnirUt1 = z.infer<typeof RawVehicleEventPtTmpUnirUt1Schema>;
