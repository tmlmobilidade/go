/* * */

import { createGtfsMapper } from '@/gtfs-new/mapper.js';
import { GtfsPathType } from '@/gtfs-new/path-type.js';
import { z } from 'zod';

/* * */

/**
 * Represents the type of path for a GTFS route.
 * This type is used to indicate whether the path is a base path, a partial path,
 * or a variant path. It is used in the GTFS-TML (Transporte Metropolitano de Lisboa) standard
 * to differentiate between different types of paths for a route.
 */
export const RoutePathTypeValues = [
	'base', // Base path. The main path for a route.
	'partial', // Partial path. A segment of the base path.
	'variant', // Variant path. An alternative path for a route.
] as const;

export const RoutePathTypeSchema = z.enum(RoutePathTypeValues);

export type RoutePathType = z.infer<typeof RoutePathTypeSchema>;

export const pathTypeMapper = createGtfsMapper<RoutePathType, GtfsPathType>({
	base: '1',
	partial: '2',
	variant: '3',
});
