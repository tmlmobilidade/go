/* * */

import { z } from 'zod';

import { InfrastructureStopsV1ExtractionSchema } from './modules/infrastructure/stops/v1/extraction.js';
import { OfferGtfsV29ExtractionSchema } from './modules/offer/gtfs/v29/extraction.js';
import { OperationRidesV1ExtractionSchema } from './modules/operation/rides/v1/extraction.js';

/* * */

export const ExtractionSchema = z.discriminatedUnion('version', [
	InfrastructureStopsV1ExtractionSchema,
	OfferGtfsV29ExtractionSchema,
	OperationRidesV1ExtractionSchema,
]);

export type Extraction = z.infer<typeof ExtractionSchema>;
