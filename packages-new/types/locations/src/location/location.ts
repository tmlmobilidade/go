/* * */

import { z } from 'zod';

/* * */

/** One administrative division, sourced from OpenStreetMap. */
export const LocationItemSchema = z.object({
	/** OSM admin_level, or `"locality"` for a neighbourhood (a `place=locality` point). */
	admin_level: z.string(),
	/** National statistics code (`ref:ine`), when the source has one. */
	code: z.string().optional(),
	name: z.string(),
	/** Absolute OSM id, unique across all levels. */
	osm_id: z.number(),
});

/**
 * Country-agnostic administrative slots. Which OSM admin_level fills each slot
 * depends on the country (PT: district / municipality / parish; ES: community / province / municipality).
 */
export const LocationSlotSchema = z.enum(['country', 'primary', 'secondary', 'tertiary']);

/** The administrative divisions containing a point. */
export const LocationSchema = z.object({
	country: LocationItemSchema,
	/** Nearest `place=locality` point, when one is close enough. */
	neighbourhood: LocationItemSchema.optional(),
	primary: LocationItemSchema,
	secondary: LocationItemSchema,
	tertiary: LocationItemSchema,
});

export type LocationItem = z.infer<typeof LocationItemSchema>;
export type LocationSlot = z.infer<typeof LocationSlotSchema>;
export type Location = z.infer<typeof LocationSchema>;
