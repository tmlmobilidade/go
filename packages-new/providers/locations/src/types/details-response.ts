/* * */

import { LatitudeSchema, LongitudeSchema } from '@tmlmobilidade/go-types-geo';
import { z } from 'zod';

import { NominatimDetailsResponseAddressSchema } from './details-response-address.js';

/* * */

export const NominatimDetailsResponseSchema = z.object({
	address: z.array(NominatimDetailsResponseAddressSchema),
	addresstags: z.object({
		postcode: z.string(),
	}),
	admin_level: z.number(),
	calculated_importance: z.number(),
	calculated_postcode: z.string(),
	category: z.string(),
	centroid: z.object({
		coordinates: z.tuple([LongitudeSchema, LatitudeSchema]),
		type: z.literal('Point'),
	}),
	country_code: z.string(),
	geometry: z.object({
		coordinates: z.tuple([LongitudeSchema, LatitudeSchema]),
		type: z.literal('Point'),
	}),
	importance: z.number(),
	indexed_date: z.string(),
	isarea: z.boolean(),
	localname: z.string(),
	names: z.object({
		name: z.string(),
	}),
	osm_id: z.number(),
	osm_type: z.string(),
	parent_place_id: z.number(),
	place_id: z.number(),
	rank_address: z.number(),
	rank_search: z.number(),
	type: z.string(),
});

/**
 * Represents the response from the Nominatim reverse geocoding API.
 */
export type NominatimDetailsResponse = z.infer<typeof NominatimDetailsResponseSchema>;
