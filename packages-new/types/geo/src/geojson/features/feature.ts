/* * */

import { type DefaultGeoJsonFeatureProperties, DefaultGeoJsonFeaturePropertiesSchema } from '@/geojson/features/properties.js';
import { GeoJsonLineStringGeometrySchema } from '@/geojson/geometry/line-string.js';
import { GeoJsonMultiLineStringGeometrySchema } from '@/geojson/geometry/multi-line-string.js';
import { GeoJsonMultiPointGeometrySchema } from '@/geojson/geometry/multi-point.js';
import { GeoJsonMultiPolygonGeometrySchema } from '@/geojson/geometry/multi-polygon.js';
import { GeoJsonPointGeometrySchema } from '@/geojson/geometry/point.js';
import { GeoJsonPolygonGeometrySchema } from '@/geojson/geometry/polygon.js';
import { z } from 'zod';

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
