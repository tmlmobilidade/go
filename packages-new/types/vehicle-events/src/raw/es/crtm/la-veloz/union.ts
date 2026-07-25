/* * */

import { z } from 'zod';

import { RawVehicleEventEsCrtmLaVelozV1Schema } from './v1.js';

/* * */

export const RawVehicleEventEsCrtmLaVelozSchema = z.discriminatedUnion('version', [
	RawVehicleEventEsCrtmLaVelozV1Schema,
]);

export type RawVehicleEventEsCrtmLaVeloz = z.infer<typeof RawVehicleEventEsCrtmLaVelozSchema>;
