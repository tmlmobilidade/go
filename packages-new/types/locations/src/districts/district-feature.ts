/* * */

import { GeoJsonMultiPolygonGeometrySchema, GeoJsonPolygonGeometrySchema } from '@tmlmobilidade/go-types-geo';
import { z } from 'zod';

import { DistrictPropertiesSchema } from './district-properties.js';

/* * */

export const DistrictFeatureSchema = z.object({
	_id: z.string(),
	geometry: z.union([
		GeoJsonPolygonGeometrySchema,
		GeoJsonMultiPolygonGeometrySchema,
	]),
	properties: DistrictPropertiesSchema,
	type: z.literal('Feature'),
});

/**
 * Represents the GeoJSON Feature for a District,
 * which is what is stored in the database.
 */
export type DistrictFeature = z.infer<typeof DistrictFeatureSchema>;
