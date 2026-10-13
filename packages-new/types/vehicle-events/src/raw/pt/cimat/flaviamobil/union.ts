/* * */

import { z } from 'zod';

import { RawVehicleEventPtCimatFlaviamobilV1Schema } from './v1.js';

/* * */

export const RawVehicleEventPtCimatFlaviamobilSchema = z.discriminatedUnion('version', [
	RawVehicleEventPtCimatFlaviamobilV1Schema,
]);

export type RawVehicleEventPtCimatFlaviamobil = z.infer<typeof RawVehicleEventPtCimatFlaviamobilSchema>;
