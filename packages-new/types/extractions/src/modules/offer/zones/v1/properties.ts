/* * */

import { z } from 'zod';

/* * */

export const OfferZonesV1ExtractionPropertiesSchema = z.object({
	zone_ids: z.array(z.string()).min(1, 'At least one zone ID is required'),
});

export type OfferZonesV1ExtractionProperties = z.infer<typeof OfferZonesV1ExtractionPropertiesSchema>;
