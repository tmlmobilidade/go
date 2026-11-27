/* * */

import { z } from 'zod';

import { ExtractionBaseCreateSchema } from '../../../../shared/base-create.js';
import { OfferZonesGeopackageV1ExtractionPropertiesSchema } from './properties.js';
import { OfferZonesGeopackageV1ExtractionVersionSchema } from './version.js';

/* * */

export const OfferZonesGeopackageV1ExtractionCreateSchema = ExtractionBaseCreateSchema.extend({
	properties: OfferZonesGeopackageV1ExtractionPropertiesSchema,
	version: OfferZonesGeopackageV1ExtractionVersionSchema,
});

export type OfferZonesGeopackageV1ExtractionCreate = z.infer<typeof OfferZonesGeopackageV1ExtractionCreateSchema>;
