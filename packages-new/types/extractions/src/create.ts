/* * */

import { z } from 'zod';

import { InfrastructureNodesV1ExtractionCreateSchema } from './modules/infrastructure/nodes/v1/create.js';
import { InfrastructureStopsV1ExtractionCreateSchema } from './modules/infrastructure/stops/v1/create.js';
import { OfferGtfsV29ExtractionCreateSchema } from './modules/offer/gtfs/v29/create.js';
import { OperationRidesV1ExtractionCreateSchema } from './modules/operation/rides/v1/create.js';
import { OperationRidesV2ExtractionCreateSchema } from './modules/operation/rides/v2/create.js';
import { OperationRidesV3ExtractionCreateSchema } from './modules/operation/rides/v3/create.js';

/* * */

export const ExtractionCreateSchema = z.discriminatedUnion('version', [
	InfrastructureNodesV1ExtractionCreateSchema,
	InfrastructureStopsV1ExtractionCreateSchema,
	OfferGtfsV29ExtractionCreateSchema,
	OperationRidesV1ExtractionCreateSchema,
	OperationRidesV2ExtractionCreateSchema,
	OperationRidesV3ExtractionCreateSchema,
]);

export type ExtractionCreate = z.infer<typeof ExtractionCreateSchema>;
