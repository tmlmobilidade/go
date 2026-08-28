/* * */

import { z } from 'zod';

import { GeoJsonLinearRingSchema } from '../base/linear-ring.js';

/* * */

export const GeoJsonPolygonGeometrySchema = z.object({
	coordinates: z.array(GeoJsonLinearRingSchema).min(1),
	type: z.literal('Polygon').default('Polygon'),
});

export type GeoJsonPolygonGeometry = z.infer<typeof GeoJsonPolygonGeometrySchema>;
