/* * */

import { z } from 'zod';

import { RawVehicleEventPtTmpUnirUt4V1Schema } from './v1.js';

/* * */

export const RawVehicleEventPtTmpUnirUt4Schema = z.discriminatedUnion('version', [
	RawVehicleEventPtTmpUnirUt4V1Schema,
]);

export type RawVehicleEventPtTmpUnirUt4 = z.infer<typeof RawVehicleEventPtTmpUnirUt4Schema>;
