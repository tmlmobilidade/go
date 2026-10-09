/* * */

import { z } from 'zod';

/* * */

export const OfferGtfsSteppV1ExtractionPropertiesSchema = z.object({

	agency_id: z.string(),

});

export type OfferGtfsSteppV1ExtractionProperties = z.infer<typeof OfferGtfsSteppV1ExtractionPropertiesSchema>;
