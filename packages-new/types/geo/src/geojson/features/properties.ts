/* * */

import { z } from 'zod';

/* * */

export const DefaultGeoJsonFeaturePropertiesSchema = z
	.record(z.string(), z.unknown())
	.default({});

export type DefaultGeoJsonFeatureProperties = z.infer<typeof DefaultGeoJsonFeaturePropertiesSchema>;
