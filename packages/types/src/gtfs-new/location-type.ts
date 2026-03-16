/* * */

import { z } from 'zod';

/* * */

/**
 * Represents a GTFS (General Transit Feed Specification) Location Type.
 * This type is used to categorize the location based on its function in the transit system.
 * Each location type corresponds to a specific role, such as a stop, station, or boarding area.
 * The values are defined according to the GTFS specification.
 */

export const GtfsLocationTypeValues = [
	'0', // Stop. A physical location where passengers can board or alight from a transit vehicle.
	'1', // Station. A physical structure or area where passengers can board or alight from a transit vehicle, typically larger than a stop and may include multiple stops.
	'2', // Station entrance. A physical entrance to a station, which may be located at a different location than the station itself.
	'3', // Generic node. A generic location that does not fit into the other categories, such as a point of interest or a landmark.
	'4', // Boarding area. A specific area within a stop or station where passengers can board a transit vehicle, such as a bus bay or train platform.
] as const;

export const GtfsLocationTypeSchema = z.enum(GtfsLocationTypeValues);

export type GtfsLocationType = z.infer<typeof GtfsLocationTypeSchema>;
