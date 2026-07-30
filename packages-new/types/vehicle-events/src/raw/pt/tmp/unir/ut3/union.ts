/* * */

import { z } from 'zod';

import { RawVehicleEventPtTmpUnirUt3V1Schema } from './v1.js';

/* * */

export const RawVehicleEventPtTmpUnirUt3Schema = z.discriminatedUnion('version', [
	RawVehicleEventPtTmpUnirUt3V1Schema,
]);

export type RawVehicleEventPtTmpUnirUt3 = z.infer<typeof RawVehicleEventPtTmpUnirUt3Schema>;
