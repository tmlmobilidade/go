/* * */

import { z } from 'zod';

import { InfrastructureStopsV1ExtractionVersionValue } from './modules/infrastructure/stops/v1/version.js';
import { OfferGtfsV29ExtractionVersionValue } from './modules/offer/gtfs/v29/version.js';
import { OperationRidesV1ExtractionVersionValue } from './modules/operation/rides/v1/version.js';
import { OperationRidesV2ExtractionVersionValue } from './modules/operation/rides/v2/version.js';

/* * */

export const ExtractionVersionValues = [
	InfrastructureStopsV1ExtractionVersionValue,
	OfferGtfsV29ExtractionVersionValue,
	OperationRidesV1ExtractionVersionValue,
	OperationRidesV2ExtractionVersionValue,
] as const;

export const ExtractionVersionSchema = z.enum(ExtractionVersionValues);

export type ExtractionVersion = z.infer<typeof ExtractionVersionSchema>;
