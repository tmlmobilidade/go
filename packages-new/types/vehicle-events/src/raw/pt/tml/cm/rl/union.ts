/* * */

import { z } from 'zod';

import { RawVehicleEventPtTmlCmRlV1Schema } from './v1.js';

/* * */

export const RawVehicleEventPtTmlCmRlSchema = z.discriminatedUnion('version', [
	RawVehicleEventPtTmlCmRlV1Schema,
]);

export type RawVehicleEventPtTmlCmRl = z.infer<typeof RawVehicleEventPtTmlCmRlSchema>;
