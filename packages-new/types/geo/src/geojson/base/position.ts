/* * */

import { LatitudeSchema } from '@/geojson/base/latitude.js';
import { LongitudeSchema } from '@/geojson/base/longitude.js';
import { z } from 'zod';

/* * */

export const GeoJson2dPositionSchema = z.tuple([LongitudeSchema, LatitudeSchema]);

export type GeoJson2dPosition = z.infer<typeof GeoJson2dPositionSchema>;

/* * */

export const GeoJson3dPositionSchema = z.tuple([LongitudeSchema, LatitudeSchema, z.number()]);

export type GeoJson3dPosition = z.infer<typeof GeoJson3dPositionSchema>;

/* * */

export const GeoJsonPositionSchema = z.union([GeoJson2dPositionSchema, GeoJson3dPositionSchema]);

export type GeoJsonPosition = z.infer<typeof GeoJsonPositionSchema>;
