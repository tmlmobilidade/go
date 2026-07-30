/* * */

import { z } from 'zod';

import { RawVehicleEventPtTmpUnirUt5V1Schema } from './v1.js';

/* * */

export const RawVehicleEventPtTmpUnirUt5Schema = z.discriminatedUnion('version', [
	RawVehicleEventPtTmpUnirUt5V1Schema,
]);

export type RawVehicleEventPtTmpUnirUt5 = z.infer<typeof RawVehicleEventPtTmpUnirUt5Schema>;
