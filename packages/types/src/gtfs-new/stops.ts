/* * */

import { z } from 'zod';

import { GtfsLocationTypeSchema } from './location-type.js';
import { GtfsWheelchairBoardingSchema } from './wheelchair-accessible.js';

/* * */

const GtfsStopAccessValues = [
	'0', // Stop/platform cannot be directly accessed from street network.
	'1', // Directly accessible from street network.
] as const;

export const GtfsStopAccessSchema = z.enum(GtfsStopAccessValues);

export type GtfsStopAccess = z.infer<typeof GtfsStopAccessSchema>;

/**
 * Represents a stop in the GTFS (General Transit Feed Specification) format.
 * A stop is a physical location where passengers can board or alight from a transit vehicle.
 * Each stop can have various attributes such as location, accessibility, and identification.
 */
export const GtfsStopSchema = z.object({
	level_id: z.string().nullish(),
	location_type: GtfsLocationTypeSchema.default('0'),
	parent_station: z.string().nullish(),
	platform_code: z.string().nullish(),
	stop_access: GtfsStopAccessSchema.nullish(),
	stop_code: z.string(),
	stop_desc: z.string().nullish(),
	stop_id: z.string(),
	stop_lat: z.number(),
	stop_lon: z.number(),
	stop_name: z.string(),
	stop_timezone: z.string().nullish(),
	stop_url: z.string().nullish(),
	tts_stop_name: z.string().nullish(),
	wheelchair_boarding: GtfsWheelchairBoardingSchema,
	zone_id: z.string().nullish(),
});
export type GtfsStop = z.infer<typeof GtfsStopSchema>;
