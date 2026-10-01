/* * */

import { z } from 'zod';

import { RawVehicleEventEsCrtmAisaV1Schema } from './v1.js';

/* * */

export const RawVehicleEventEsCrtmAisaSchema = z.discriminatedUnion('version', [
	RawVehicleEventEsCrtmAisaV1Schema,
]);

export type RawVehicleEventEsCrtmAisa = z.infer<typeof RawVehicleEventEsCrtmAisaSchema>;
