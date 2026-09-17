/* * */

import { z } from 'zod';

import { InfrastructureStopsV1ExtractionCreateSchema } from './modules/infrastructure/stops/v1/create.js';
import { OfferGtfsV29ExtractionCreateSchema } from './modules/offer/gtfs/v29/create.js';
import { OperationPostersV1ExtractionCreateSchema } from './modules/operation/posters/v1/create.js';
import { OperationRidesV1ExtractionCreateSchema } from './modules/operation/rides/v1/create.js';

/* * */

export const ExtractionCreateSchema = z.discriminatedUnion('version', [
	InfrastructureStopsV1ExtractionCreateSchema,
	OfferGtfsV29ExtractionCreateSchema,
	OperationPostersV1ExtractionCreateSchema,
	OperationRidesV1ExtractionCreateSchema,
]);

export type ExtractionCreate = z.infer<typeof ExtractionCreateSchema>;
