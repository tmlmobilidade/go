/* * */

import { z } from 'zod';

import { GeoJsonLineStringGeometrySchema } from '../geometry/line-string.js';
import { GeoJsonMultiLineStringGeometrySchema } from '../geometry/multi-line-string.js';
import { GeoJsonMultiPointGeometrySchema } from '../geometry/multi-point.js';
import { GeoJsonMultiPolygonGeometrySchema } from '../geometry/multi-polygon.js';
import { GeoJsonPointGeometrySchema } from '../geometry/point.js';
import { GeoJsonPolygonGeometrySchema } from '../geometry/polygon.js';
import { type DefaultGeoJsonFeatureProperties, DefaultGeoJsonFeaturePropertiesSchema } from './properties.js';

/* * */

export const GeoJsonFeatureSchema = <T extends z.ZodTypeAny = typeof DefaultGeoJsonFeaturePropertiesSchema>(propertiesSchema: T = DefaultGeoJsonFeaturePropertiesSchema as unknown as T) => {
	return z.object({
		geometry: z.union([
			GeoJsonPointGeometrySchema,
			GeoJsonMultiPointGeometrySchema,
			GeoJsonLineStringGeometrySchema,
			GeoJsonMultiLineStringGeometrySchema,
			GeoJsonPolygonGeometrySchema,
			GeoJsonMultiPolygonGeometrySchema,
		]),
		properties: propertiesSchema.nullable().default(null),
		type: z.literal('Feature'),
	});
};

export type GeoJsonFeature<T = DefaultGeoJsonFeatureProperties> = Omit<z.infer<ReturnType<typeof GeoJsonFeatureSchema>>, 'properties'> & { properties: null | T };
