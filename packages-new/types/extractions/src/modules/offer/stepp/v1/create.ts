/* * */

import { z } from 'zod';

import { ExtractionBaseCreateSchema } from '../../../../shared/base-create.js';
import { OfferGtfsSteppV1ExtractionPropertiesSchema } from './properties.js';
import { OfferGtfsSteppV1ExtractionVersionSchema } from './version.js';

/* * */

export const OfferGtfsSteppV1ExtractionCreateSchema = ExtractionBaseCreateSchema.extend({
	properties: OfferGtfsSteppV1ExtractionPropertiesSchema,
	version: OfferGtfsSteppV1ExtractionVersionSchema,
});

export type OfferGtfsSteppV1ExtractionCreate = z.infer<typeof OfferGtfsSteppV1ExtractionCreateSchema>;
