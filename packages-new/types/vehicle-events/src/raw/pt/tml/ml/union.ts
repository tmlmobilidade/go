/* * */

import { z } from 'zod';

import { RawVehicleEventPtTmlMlV1Schema } from './v1.js';

/* * */

export const RawVehicleEventPtTmlMlSchema = z.discriminatedUnion('version', [
	RawVehicleEventPtTmlMlV1Schema,
]);

export type RawVehicleEventPtTmlMl = z.infer<typeof RawVehicleEventPtTmlMlSchema>;
