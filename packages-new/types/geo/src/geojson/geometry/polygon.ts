/* * */

import { GeoJsonLinearRingSchema } from '@/geojson/base/linear-ring.js';
import { z } from 'zod';

/* * */

export const GeoJsonPolygonGeometrySchema = z.object({
	coordinates: z.array(GeoJsonLinearRingSchema).min(1),
	type: z.literal('Polygon'),
});

export type GeoJsonPolygonGeometry = z.infer<typeof GeoJsonPolygonGeometrySchema>;
