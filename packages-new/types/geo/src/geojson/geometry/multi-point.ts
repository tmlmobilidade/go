/* * */

import { z } from 'zod';

import { GeoJsonPositionSchema } from '../base/position.js';

/* * */

export const GeoJsonMultiPointGeometrySchema = z.object({
	coordinates: z.array(GeoJsonPositionSchema),
	type: z.literal('MultiPoint').default('MultiPoint'),
});

export type GeoJsonMultiPointGeometry = z.infer<typeof GeoJsonMultiPointGeometrySchema>;
