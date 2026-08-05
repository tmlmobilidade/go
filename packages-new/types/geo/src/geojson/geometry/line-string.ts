/* * */

import { GeoJsonPositionSchema } from '@/geojson/base/position.js';
import { z } from 'zod';

/* * */

export const GeoJsonLineStringGeometrySchema = z.object({
	coordinates: z.array(GeoJsonPositionSchema).min(2),
	type: z.literal('LineString'),
});

export type GeoJsonLineStringGeometry = z.infer<typeof GeoJsonLineStringGeometrySchema>;
