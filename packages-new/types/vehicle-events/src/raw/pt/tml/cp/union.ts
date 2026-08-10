/* * */

import { z } from 'zod';

import { RawVehicleEventPtTmlCpV1Schema } from './v1.js';

/* * */

export const RawVehicleEventPtTmlCpSchema = z.discriminatedUnion('version', [
	RawVehicleEventPtTmlCpV1Schema,
]);

export type RawVehicleEventPtTmlCp = z.infer<typeof RawVehicleEventPtTmlCpSchema>;
