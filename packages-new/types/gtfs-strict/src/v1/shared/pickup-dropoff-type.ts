/* * */

import { z } from 'zod';

/* * */

export const GtfsPickupDropoffTypeValues = [
	'0', // Continuous pickup or drop-off allowed
	'1', // Regular pickup or drop-off where the vehicle stops at predefined locations
	'2', // Must contact transit agency to arrange pickup or drop-off
	'3', // Must contact driver to arrange pickup or drop-off
] as const;

export const GtfsPickupDropoffTypeSchema = z.enum(GtfsPickupDropoffTypeValues).default('1');

/**
 * Represents the type of pickup or drop-off allowed for a transit service.
 * This is used in GTFS to indicate how passengers can be picked up or dropped off
 * at stops along a route.
 */
export type GtfsPickupDropoffType = z.infer<typeof GtfsPickupDropoffTypeSchema>;
