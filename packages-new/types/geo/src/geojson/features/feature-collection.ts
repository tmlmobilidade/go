/* * */

import { z } from 'zod';

import { GeoJsonFeature, GeoJsonFeatureSchema } from './feature.js';
import { DefaultGeoJsonFeatureProperties, DefaultGeoJsonFeaturePropertiesSchema } from './properties.js';

/* * */

export const GeoJsonFeatureCollectionSchema = <T extends z.ZodTypeAny = typeof DefaultGeoJsonFeaturePropertiesSchema>(propertiesSchema: T = DefaultGeoJsonFeaturePropertiesSchema as unknown as T) => {
	return z.object({
		features: z.array(GeoJsonFeatureSchema(propertiesSchema)).default([]),
		type: z.literal('FeatureCollection').default('FeatureCollection'),
	});
};

export type GeoJsonFeatureCollection<T = DefaultGeoJsonFeatureProperties> = Omit<z.infer<ReturnType<typeof GeoJsonFeatureCollectionSchema>>, 'features'> & { features: GeoJsonFeature<T>[] };
