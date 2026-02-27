/* * */

import { z } from 'zod';

/**
 * Represents the type of path for a GTFS route.
 * This type is used to indicate whether the path is a base path, a partial path,
 * or a variant path. It is used in the GTFS-TML (Transporte Metropolitano de Lisboa) standard
 * to differentiate between different types of paths for a route.
 */
export const GtfsPathTypeSchema = z.union([
	z.literal(1), // Base path
	z.literal(2), // Partial path
	z.literal(3), // Variant path
]);
export type GtfsPathType = z.infer<typeof GtfsPathTypeSchema>;
