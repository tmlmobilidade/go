/* * */

import { z } from 'zod';

/* * */

/**
 * Represents a GTFS (General Transit Feed Specification) Location Type.
 * This type is used to categorize the location based on its function in the transit system.
 * Each location type corresponds to a specific role, such as a stop, station, or boarding area.
 * The values are defined according to the GTFS specification.
 */
export const GtfsLocationTypeSchema = z.union([
	z.literal(0),
	z.literal(1),
	z.literal(2),
	z.literal(3),
	z.literal(4),
]);
