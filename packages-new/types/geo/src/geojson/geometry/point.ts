/* * */

import { GeoJsonPositionSchema } from '@/geojson/base/position.js';
import { z } from 'zod';

/* * */

export const GeoJsonPointGeometrySchema = z.object({
	coordinates: GeoJsonPositionSchema,
	type: z.literal('Point'),
});

export type GeoJsonPointGeometry = z.infer<typeof GeoJsonPointGeometrySchema>;
