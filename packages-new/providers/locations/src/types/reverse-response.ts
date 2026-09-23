/* * */

import { LatitudeSchema, LongitudeSchema } from '@tmlmobilidade/go-types-geo';
import { z } from 'zod';

/* * */

export const NominatimReverseResponseSchema = z.object({
	address: z.object({
		city: z.string(),
		city_district: z.string(),
		country: z.string(),
		country_code: z.string(),
		county: z.string(),
		postcode: z.string(),
		road: z.string(),
	}),
	addresstype: z.string(),
	boundingbox: z.tuple([
		LatitudeSchema,
		LatitudeSchema,
		LongitudeSchema,
		LongitudeSchema,
	]),
	category: z.string(),
	display_name: z.string(),
	importance: z.number(),
	lat: LatitudeSchema,
	licence: z.string(),
	lon: LongitudeSchema,
	name: z.string(),
	osm_id: z.number(),
	osm_type: z.string(),
	place_id: z.number(),
	place_rank: z.number(),
	type: z.string(),
});

/**
 * Represents the response from the Nominatim reverse geocoding API.
 */
export type NominatimReverseResponse = z.infer<typeof NominatimReverseResponseSchema>;
