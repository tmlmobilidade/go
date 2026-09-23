/* * */

import { z } from 'zod';

/* * */

export const NominatimDetailsRequestSchema = z.object({
	osm_id: z.number(),
	osm_type: z.enum(['W', 'R', 'N']),
});

/**
 * Represents the request to the Nominatim details API.
 */
export type NominatimDetailsRequest = z.infer<typeof NominatimDetailsRequestSchema>;
