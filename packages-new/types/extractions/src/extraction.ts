/* * */

import { z } from 'zod';

import { InfrastructureStopsV1ExtractionSchema } from './modules/infrastructure/stops/v1/extraction.js';
import { OperationRidesV1ExtractionSchema } from './modules/operation/rides/v1/extraction.js';

/* * */

export const ExtractionSchema = z.discriminatedUnion('version', [
	InfrastructureStopsV1ExtractionSchema,
	OperationRidesV1ExtractionSchema,
]);

export type Extraction = z.infer<typeof ExtractionSchema>;
