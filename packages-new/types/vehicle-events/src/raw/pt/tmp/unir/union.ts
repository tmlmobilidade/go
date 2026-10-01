/* * */

import { z } from 'zod';

import { RawVehicleEventPtTmpUnirUt1V1Schema } from './ut1/v1.js';
import { RawVehicleEventPtTmpUnirUt2V1Schema } from './ut2/v1.js';
import { RawVehicleEventPtTmpUnirUt3V1Schema } from './ut3/v1.js';
import { RawVehicleEventPtTmpUnirUt4V1Schema } from './ut4/v1.js';
import { RawVehicleEventPtTmpUnirUt5V1Schema } from './ut5/v1.js';

/* * */

export const RawVehicleEventPtTmpUnirSchema = z.discriminatedUnion('version', [
	RawVehicleEventPtTmpUnirUt1V1Schema,
	RawVehicleEventPtTmpUnirUt2V1Schema,
	RawVehicleEventPtTmpUnirUt3V1Schema,
	RawVehicleEventPtTmpUnirUt4V1Schema,
	RawVehicleEventPtTmpUnirUt5V1Schema,
]);

export type RawVehicleEventPtTmpUnir = z.infer<typeof RawVehicleEventPtTmpUnirSchema>;
