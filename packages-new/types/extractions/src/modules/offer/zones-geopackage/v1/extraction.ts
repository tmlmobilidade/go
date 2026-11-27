/* * */

import { z } from 'zod';

import { ExtractionBaseSchema } from '../../../../shared/base.js';
import { OfferZonesGeopackageV1ExtractionCreateSchema } from './create.js';

/* * */

export const OfferZonesGeopackageV1ExtractionSchema = ExtractionBaseSchema
	.merge(OfferZonesGeopackageV1ExtractionCreateSchema);

export type OfferZonesGeopackageV1Extraction = z.infer<typeof OfferZonesGeopackageV1ExtractionSchema>;
