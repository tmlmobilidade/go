/* * */

import { z } from 'zod';

import { type Latitude, LatitudeSchema } from './latitude.js';
import { type Longitude, LongitudeSchema } from './longitude.js';

/* * */

export type GeoJson2dPosition = [Longitude, Latitude];
export const GeoJson2dPositionSchema: z.ZodType<GeoJson2dPosition, [unknown, unknown]> = z.tuple([LongitudeSchema, LatitudeSchema]);

/* * */

export type GeoJson3dPosition = [Longitude, Latitude, number];
export const GeoJson3dPositionSchema: z.ZodType<GeoJson3dPosition, [unknown, unknown, number]> = z.tuple([LongitudeSchema, LatitudeSchema, z.number()]);

/* * */

export const GeoJsonPositionSchema = z.union([GeoJson2dPositionSchema, GeoJson3dPositionSchema]);

export type GeoJsonPosition = z.infer<typeof GeoJsonPositionSchema>;
