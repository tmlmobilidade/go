/* * */

import { z } from 'zod';

/* * */

export const NominatimDetailsResponseAddressSchema = z.object({
	admin_level: z.number(),
	class: z.string(),
	distance: z.number(),
	isaddress: z.boolean(),
	localname: z.string(),
	osm_id: z.number(),
	osm_type: z.string(),
	place_id: z.number(),
	rank_address: z.number(),
	type: z.string(),
});

/**
 * Represents the address of a location from the Nominatim details API.
 */
export type NominatimDetailsResponseAddress = z.infer<typeof NominatimDetailsResponseAddressSchema>;
