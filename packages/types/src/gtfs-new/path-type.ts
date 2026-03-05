/* * */

import { z } from 'zod';

/**
 * Represents the type of path for a GTFS route.
 * This type is used to indicate whether the path is a base path, a partial path,
 * or a variant path. It is used in the GTFS-TML (Transporte Metropolitano de Lisboa) standard
 * to differentiate between different types of paths for a route.
 */
export const GtfsPathTypeValues = [
	'1', // Base path. The main path for a route.
	'2', // Partial path. A segment of the base path.
	'3', // Variant path. An alternative path for a route.
] as const;

export const GtfsPathTypeSchema = z.enum(GtfsPathTypeValues);

export type GtfsPathType = z.infer<typeof GtfsPathTypeSchema>;
