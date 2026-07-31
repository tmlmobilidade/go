/* * */

import { GeoJsonPositionSchema } from '@/geojson/base/position.js';
import { z } from 'zod';

/* * */

export const GeoJsonMultiPointGeometrySchema = z.object({
	coordinates: z.array(GeoJsonPositionSchema),
	type: z.literal('MultiPoint'),
});

export type GeoJsonMultiPointGeometry = z.infer<typeof GeoJsonMultiPointGeometrySchema>;
