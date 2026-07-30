/* * */

import { z } from 'zod';

import { RawVehicleEventPtTmlCmAlsaV1Schema } from './v1.js';

/* * */

export const RawVehicleEventPtTmlCmAlsaSchema = z.discriminatedUnion('version', [
	RawVehicleEventPtTmlCmAlsaV1Schema,
]);

export type RawVehicleEventPtTmlCmAlsa = z.infer<typeof RawVehicleEventPtTmlCmAlsaSchema>;
