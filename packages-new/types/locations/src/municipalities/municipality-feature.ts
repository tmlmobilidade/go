/* * */

import { GeoJsonMultiPolygonGeometrySchema, GeoJsonPolygonGeometrySchema } from '@tmlmobilidade/go-types-geo';
import { z } from 'zod';

import { MunicipalityPropertiesSchema } from './municipality-properties.js';

/* * */

export const MunicipalityFeatureSchema = z.object({
	_id: z.string(),
	geometry: z.union([
		GeoJsonPolygonGeometrySchema,
		GeoJsonMultiPolygonGeometrySchema,
	]),
	properties: MunicipalityPropertiesSchema,
	type: z.literal('Feature'),
});

/**
 * Represents the GeoJSON Feature for a Municipality,
 * which is what is stored in the database.
 */
export type MunicipalityFeature = z.infer<typeof MunicipalityFeatureSchema>;
