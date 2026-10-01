/* * */

import { z } from 'zod';

import { RawVehicleEventPtTmlCmAlsaV1Schema } from './alsa/v1.js';
import { RawVehicleEventPtTmlCmRlV1Schema } from './rl/v1.js';
import { RawVehicleEventPtTmlCmTstV1Schema } from './tst/v1.js';
import { RawVehicleEventPtTmlCmVaV1Schema } from './va/v1.js';

/* * */

export const RawVehicleEventPtTmlCmSchema = z.discriminatedUnion('version', [
	RawVehicleEventPtTmlCmAlsaV1Schema,
	RawVehicleEventPtTmlCmRlV1Schema,
	RawVehicleEventPtTmlCmTstV1Schema,
	RawVehicleEventPtTmlCmVaV1Schema,
]);

export type RawVehicleEventPtTmlCm = z.infer<typeof RawVehicleEventPtTmlCmSchema>;
