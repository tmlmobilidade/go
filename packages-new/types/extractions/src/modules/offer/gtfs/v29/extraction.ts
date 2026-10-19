/* * */

import { z } from 'zod';

import { ExtractionBaseSchema } from '../../../../shared/base.js';
import { OfferGtfsV29ExtractionCreateSchema } from './create.js';

/* * */

export const OfferGtfsV29ExtractionSchema = ExtractionBaseSchema
	.merge(OfferGtfsV29ExtractionCreateSchema);

export type OfferGtfsV29Extraction = z.infer<typeof OfferGtfsV29ExtractionSchema>;
