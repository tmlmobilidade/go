/* * */

import { z } from 'zod';

import { RawVehicleEventPtTmlTcbV1Schema } from './v1.js';

/* * */

export const RawVehicleEventPtTmlTcbSchema = z.discriminatedUnion('version', [
	RawVehicleEventPtTmlTcbV1Schema,
]);

export type RawVehicleEventPtTmlTcb = z.infer<typeof RawVehicleEventPtTmlTcbSchema>;
