/* * */

import { z } from 'zod';

import { ExtractionBaseSchema } from '../../../../shared/base.js';
import { OfferZonesV1ExtractionCreateSchema } from './create.js';

/* * */

export const OfferZonesV1ExtractionSchema = ExtractionBaseSchema
	.merge(OfferZonesV1ExtractionCreateSchema);

export type OfferZonesV1Extraction = z.infer<typeof OfferZonesV1ExtractionSchema>;
