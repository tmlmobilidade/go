/* * */

import { z } from 'zod';

import { RawVehicleEventPtTmlCmVaV1Schema } from './v1.js';

/* * */

export const RawVehicleEventPtTmlCmVaSchema = z.discriminatedUnion('version', [
	RawVehicleEventPtTmlCmVaV1Schema,
]);

export type RawVehicleEventPtTmlCmVa = z.infer<typeof RawVehicleEventPtTmlCmVaSchema>;
