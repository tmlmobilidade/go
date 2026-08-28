/* * */

import { z } from 'zod';

import { GeoJsonPositionSchema } from '../base/position.js';

/* * */

export const GeoJsonMultiLineStringGeometrySchema = z.object({
	coordinates: z.array(z.array(GeoJsonPositionSchema).min(2)).min(1),
	type: z.literal('MultiLineString').default('MultiLineString'),
});

export type GeoJsonMultiLineStringGeometry = z.infer<typeof GeoJsonMultiLineStringGeometrySchema>;
