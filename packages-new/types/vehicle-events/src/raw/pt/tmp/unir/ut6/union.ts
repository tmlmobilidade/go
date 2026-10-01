/* * */

import { z } from 'zod';

import { RawVehicleEventPtTmpUnirUt6V1Schema } from './v1.js';

/* * */

export const RawVehicleEventPtTmpUnirUt6Schema = z.discriminatedUnion('version', [
	RawVehicleEventPtTmpUnirUt6V1Schema,
]);

export type RawVehicleEventPtTmpUnirUt6 = z.infer<typeof RawVehicleEventPtTmpUnirUt6Schema>;
