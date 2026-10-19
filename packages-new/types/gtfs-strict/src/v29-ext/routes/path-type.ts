/* * */

import { z } from 'zod';

/* * */

export const GtfsStrictV29ExtPathTypeValues = [
	'1', // Base path. The main path for a route.
	'2', // Partial path. A segment of the base path.
	'3', // Variant path. An alternative path for a route.
] as const;

export const GtfsStrictV29ExtPathTypeSchema = z.enum(GtfsStrictV29ExtPathTypeValues);

/**
 * Represents the type of path for a GTFS strict v1 route.
 * This type is used to indicate whether the path is a base path, a partial path,
 * or a variant path. It is used in the custom GTFS strict v1 format to differentiate
 * between different types of paths for a route.
 */
export type GtfsStrictV29ExtPathType = z.infer<typeof GtfsStrictV29ExtPathTypeSchema>;
