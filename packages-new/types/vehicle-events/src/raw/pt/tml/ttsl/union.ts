/* * */

import { z } from 'zod';

import { RawVehicleEventPtTmlTtslV1Schema } from './v1.js';

/* * */

export const RawVehicleEventPtTmlTtslSchema = z.discriminatedUnion('version', [
	RawVehicleEventPtTmlTtslV1Schema,
]);

export type RawVehicleEventPtTmlTtsl = z.infer<typeof RawVehicleEventPtTmlTtslSchema>;
