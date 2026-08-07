/* * */

import { z } from 'zod';

import { RawVehicleEventPtTmlCmTstV1Schema } from './v1.js';

/* * */

export const RawVehicleEventPtTmlCmTstSchema = z.discriminatedUnion('version', [
	RawVehicleEventPtTmlCmTstV1Schema,
]);

export type RawVehicleEventPtTmlCmTst = z.infer<typeof RawVehicleEventPtTmlCmTstSchema>;
