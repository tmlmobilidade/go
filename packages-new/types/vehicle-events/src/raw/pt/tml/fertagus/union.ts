/* * */

import { z } from 'zod';

import { RawVehicleEventPtTmlFertagusV1Schema } from './v1.js';

/* * */

export const RawVehicleEventPtTmlFertagusSchema = z.discriminatedUnion('version', [
	RawVehicleEventPtTmlFertagusV1Schema,
]);

export type RawVehicleEventPtTmlFertagus = z.infer<typeof RawVehicleEventPtTmlFertagusSchema>;
