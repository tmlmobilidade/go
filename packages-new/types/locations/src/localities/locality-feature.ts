/* * */

import { GeoJsonMultiPolygonGeometrySchema, GeoJsonPolygonGeometrySchema } from '@tmlmobilidade/go-types-geo';
import { z } from 'zod';

import { LocalityPropertiesSchema } from './locality-properties.js';

/* * */

export const LocalityFeatureSchema = z.object({
	_id: z.string(),
	geometry: z.union([
		GeoJsonPolygonGeometrySchema,
		GeoJsonMultiPolygonGeometrySchema,
	]),
	properties: LocalityPropertiesSchema,
	type: z.literal('Feature'),
});

/**
 * Represents the GeoJSON Feature for a Locality,
 * which is what is stored in the database.
 */
export type LocalityFeature = z.infer<typeof LocalityFeatureSchema>;
