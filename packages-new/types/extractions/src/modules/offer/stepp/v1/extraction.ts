/* * */

import { z } from 'zod';

import { ExtractionBaseSchema } from '../../../../shared/base.js';
import { OfferSteppV1ExtractionCreateSchema } from './create.js';

/* * */

export const OfferSteppV1ExtractionSchema = ExtractionBaseSchema
	.merge(OfferSteppV1ExtractionCreateSchema);

export type OfferSteppV1Extraction = z.infer<typeof OfferSteppV1ExtractionSchema>;
