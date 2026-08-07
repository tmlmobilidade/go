/* * */

import { GeoJsonPositionSchema } from '@/geojson/base/position.js';
import { z } from 'zod';

/* * */

export const GeoJsonMultiLineStringGeometrySchema = z.object({
	coordinates: z.array(z.array(GeoJsonPositionSchema).min(2)).min(1),
	type: z.literal('MultiLineString'),
});

export type GeoJsonMultiLineStringGeometry = z.infer<typeof GeoJsonMultiLineStringGeometrySchema>;
