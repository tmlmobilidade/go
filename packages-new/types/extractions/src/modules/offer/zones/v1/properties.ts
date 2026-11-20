/* * */

import { z } from 'zod';

/* * */

/** The active Zones list filters, including the search query. */
export const OfferZonesV1ExtractionPropertiesSchema = z.object({

	agency_ids: z
		.array(z.string().min(1))
		.min(1),

	search: z
		.string()
		.optional(),

});

export type OfferZonesV1ExtractionProperties = z.infer<typeof OfferZonesV1ExtractionPropertiesSchema>;
