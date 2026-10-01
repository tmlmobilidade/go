/* * */

import { z } from 'zod';

import { RawVehicleEventPtTmpUnirUt2V1Schema } from './v1.js';

/* * */

export const RawVehicleEventPtTmpUnirUt2Schema = z.discriminatedUnion('version', [
	RawVehicleEventPtTmpUnirUt2V1Schema,
]);

export type RawVehicleEventPtTmpUnirUt2 = z.infer<typeof RawVehicleEventPtTmpUnirUt2Schema>;
