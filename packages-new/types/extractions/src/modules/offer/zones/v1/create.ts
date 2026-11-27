/* * */

import { z } from 'zod';

import { ExtractionBaseCreateSchema } from '../../../../shared/base-create.js';
import { OfferZonesV1ExtractionPropertiesSchema } from './properties.js';
import { OfferZonesV1ExtractionVersionSchema } from './version.js';

/* * */

export const OfferZonesV1ExtractionCreateSchema = ExtractionBaseCreateSchema.extend({
	properties: OfferZonesV1ExtractionPropertiesSchema,
	version: OfferZonesV1ExtractionVersionSchema,
});

export type OfferZonesV1ExtractionCreate = z.infer<typeof OfferZonesV1ExtractionCreateSchema>;
