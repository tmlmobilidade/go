/* * */

import { z } from 'zod';

import { InfrastructureStopsV1ExtractionSchema } from './modules/infrastructure/stops/v1/extraction.js';
import { OfferGtfsV29ExtractionSchema } from './modules/offer/gtfs/v29/extraction.js';
import { OperationRidesV1ExtractionSchema } from './modules/operation/rides/v1/extraction.js';
import { OperationRidesV2ExtractionSchema } from './modules/operation/rides/v2/extraction.js';
import { OperationRidesV3ExtractionSchema } from './modules/operation/rides/v3/extraction.js';

/* * */

export const ExtractionSchema = z.discriminatedUnion('version', [
	InfrastructureStopsV1ExtractionSchema,
	OfferGtfsV29ExtractionSchema,
	OperationRidesV1ExtractionSchema,
	OperationRidesV2ExtractionSchema,
	OperationRidesV3ExtractionSchema,
]);

export type Extraction = z.infer<typeof ExtractionSchema>;
