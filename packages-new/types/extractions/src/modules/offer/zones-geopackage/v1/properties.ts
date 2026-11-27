import { z } from 'zod';

/* * */

export const OfferZonesGeopackageV1ExtractionPropertiesSchema = z.object({
	zone_ids: z.array(z.string().min(1)).min(1),
});

export type OfferZonesGeopackageV1ExtractionProperties = z.infer<typeof OfferZonesGeopackageV1ExtractionPropertiesSchema>;
