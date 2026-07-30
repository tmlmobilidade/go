/* * */

import { z } from 'zod';

import { RawVehicleEventPtTmlMobiV1Schema } from './v1.js';

/* * */

export const RawVehicleEventPtTmlMobiSchema = z.discriminatedUnion('version', [
	RawVehicleEventPtTmlMobiV1Schema,
]);

export type RawVehicleEventPtTmlMobi = z.infer<typeof RawVehicleEventPtTmlMobiSchema>;
