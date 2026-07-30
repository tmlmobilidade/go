/* * */

import { z } from 'zod';

/* * */

export const GtfsStrictV1PathTypeValues = [
	'1', // Base path. The main path for a route.
	'2', // Partial path. A segment of the base path.
	'3', // Variant path. An alternative path for a route.
] as const;

export const GtfsStrictV1PathTypeSchema = z.enum(GtfsStrictV1PathTypeValues);

/**
 * Represents the type of path for a GTFS strict v1 route.
 * This type is used to indicate whether the path is a base path, a partial path,
 * or a variant path. It is used in the custom GTFS strict v1 format to differentiate
 * between different types of paths for a route.
 */
export type GtfsStrictV1PathType = z.infer<typeof GtfsStrictV1PathTypeSchema>;
