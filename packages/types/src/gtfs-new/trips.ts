/* * */

import { z } from 'zod';

import { GtfsWheelchairBoardingSchema } from './wheelchair-accessible.js';

/* * */

const GtfsBikesAllowedValues = [
	'0', // No information
	'1', // Can accommodate at least one bicycle.
	'2', // Bikes not allowed
] as const;
export const GtfsBikesAllowedSchema = z.enum(GtfsBikesAllowedValues);
export type GtfsBikesAllowed = z.infer<typeof GtfsBikesAllowedSchema>;

export const GtfsDirectionValues = [
	'0', // Travel in one direction (e.g., outbound)
	'1', // Travel in the opposite direction (e.g., inbound)
] as const;
export const GtfsDirectionSchema = z.enum(GtfsDirectionValues);
export type GtfsDirection = z.infer<typeof GtfsDirectionSchema>;

/**
 * Represents a trip in the GTFS (General Transit Feed Specification) format.
 * A trip is a sequence of one or more stops that a vehicle makes during its operation.
 * Each trip is associated with a specific route and service schedule.
 * The trip can have various attributes such as headsign, direction, and accessibility options.
 */
export const GtfsTripSchema = z.object({
	bikes_allowed: GtfsBikesAllowedSchema.default('0'),
	block_id: z.string().nullish(),
	direction_id: GtfsDirectionSchema.default('0'),
	route_id: z.string(),
	service_id: z.string(),
	shape_id: z.string(),
	trip_headsign: z.string().nullish(),
	trip_id: z.string(),
	trip_short_name: z.string().nullish(),
	wheelchair_accessible: GtfsWheelchairBoardingSchema.default('0'),
});
export type GtfsTrip = z.infer<typeof GtfsTripSchema>;
