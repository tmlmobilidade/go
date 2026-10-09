/* * */

import { z } from 'zod';

import { ExtractionBaseCreateSchema } from '../../../../shared/base-create.js';
import { OfferSteppV1ExtractionPropertiesSchema } from './properties.js';
import { OfferSteppV1ExtractionVersionSchema } from './version.js';

/* * */

export const OfferSteppV1ExtractionCreateSchema = ExtractionBaseCreateSchema.extend({
	properties: OfferSteppV1ExtractionPropertiesSchema,
	version: OfferSteppV1ExtractionVersionSchema,
});

export type OfferSteppV1ExtractionCreate = z.infer<typeof OfferSteppV1ExtractionCreateSchema>;
