/* * */

import { LatitudeSchema, LongitudeSchema } from '@tmlmobilidade/go-types-geo';
import { z } from 'zod';

/* * */

export const NominatimReverseRequestSchema = z.object({
	latitude: LatitudeSchema,
	longitude: LongitudeSchema,
});

/**
 * Represents the request to the Nominatim reverse geocoding API.
 */
export type NominatimReverseRequest = z.infer<typeof NominatimReverseRequestSchema>;
