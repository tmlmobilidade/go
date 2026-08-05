/* * */

import { GeoJsonFeatureSchema } from '@/geojson/features/feature.js';
import { z } from 'zod';

/* * */

export const GeoJsonFeatureCollectionSchema = z.object({
	features: z.array(GeoJsonFeatureSchema).min(1),
	type: z.literal('FeatureCollection'),
});

export type GeoJsonFeatureCollection = z.infer<typeof GeoJsonFeatureCollectionSchema>;
