/* * */

import { z } from 'zod';

import { ExtractionBaseCreateSchema } from '../../../../shared/base-create.js';
import { OfferGtfsV29ExtractionPropertiesSchema } from './properties.js';
import { OfferGtfsV29ExtractionVersionSchema } from './version.js';

/* * */

export const OfferGtfsV29ExtractionCreateSchema = ExtractionBaseCreateSchema.extend({
	properties: OfferGtfsV29ExtractionPropertiesSchema,
	version: OfferGtfsV29ExtractionVersionSchema,
});

export type OfferGtfsV29ExtractionCreate = z.infer<typeof OfferGtfsV29ExtractionCreateSchema>;
