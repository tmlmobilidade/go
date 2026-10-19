/* * */

import { z } from 'zod';

import { GeoJsonPositionSchema } from '../base/position.js';

/* * */

export const GeoJsonPointGeometrySchema = z.object({
	coordinates: GeoJsonPositionSchema,
	type: z.literal('Point').default('Point'),
});

export type GeoJsonPointGeometry = z.infer<typeof GeoJsonPointGeometrySchema>;
