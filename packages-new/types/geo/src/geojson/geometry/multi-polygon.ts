/* * */

import { z } from 'zod';

import { GeoJsonLinearRingSchema } from '../base/linear-ring.js';

/* * */

export const GeoJsonMultiPolygonGeometrySchema = z.object({
	coordinates: z.array(z.array(GeoJsonLinearRingSchema).min(1)).min(1),
	type: z.literal('MultiPolygon').default('MultiPolygon'),
});

export type GeoJsonMultiPolygonGeometry = z.infer<typeof GeoJsonMultiPolygonGeometrySchema>;
