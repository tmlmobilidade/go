/* * */

import { z } from 'zod';

import { ExtractionBaseSchema } from '../../../../shared/base.js';
import { OfferGtfsSteppV1ExtractionCreateSchema } from './create.js';

/* * */

export const OfferGtfsSteppV1ExtractionSchema = ExtractionBaseSchema
	.merge(OfferGtfsSteppV1ExtractionCreateSchema);

export type OfferGtfsSteppV1Extraction = z.infer<typeof OfferGtfsSteppV1ExtractionSchema>;
