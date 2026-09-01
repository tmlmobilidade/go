/* * */

import { GeoJsonMultiPolygonGeometrySchema, GeoJsonPolygonGeometrySchema } from '@tmlmobilidade/go-types-geo';
import { z } from 'zod';

import { ParishPropertiesSchema } from './parish-properties.js';

/* * */

export const ParishFeatureSchema = z.object({
	_id: z.string(),
	geometry: z.union([
		GeoJsonPolygonGeometrySchema,
		GeoJsonMultiPolygonGeometrySchema,
	]),
	properties: ParishPropertiesSchema,
	type: z.literal('Feature'),
});

/**
 * Represents the GeoJSON Feature for a Parish,
 * which is what is stored in the database.
 */
export type ParishFeature = z.infer<typeof ParishFeatureSchema>;
