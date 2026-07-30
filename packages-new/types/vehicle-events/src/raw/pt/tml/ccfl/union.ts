/* * */

import { z } from 'zod';

import { RawVehicleEventPtTmlCcflV1Schema } from './v1.js';

/* * */

export const RawVehicleEventPtTmlCcflSchema = z.discriminatedUnion('version', [
	RawVehicleEventPtTmlCcflV1Schema,
]);

export type RawVehicleEventPtTmlCcfl = z.infer<typeof RawVehicleEventPtTmlCcflSchema>;
