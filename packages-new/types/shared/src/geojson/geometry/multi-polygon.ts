/* * */

import { GeoJsonLinearRingSchema } from '@/index.js';
import { z } from 'zod';

/* * */

export const GeoJsonMultiPolygonGeometrySchema = z.object({
	coordinates: z.array(z.array(GeoJsonLinearRingSchema).min(1)).min(1),
	type: z.literal('MultiPolygon'),
});

export type GeoJsonMultiPolygonGeometry = z.infer<typeof GeoJsonMultiPolygonGeometrySchema>;
