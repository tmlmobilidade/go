/* * */

import { z } from 'zod';

/* * */

export const OfferSteppV1ExtractionPropertiesSchema = z.object({

	agency_id: z.string(),

});

export type OfferSteppV1ExtractionProperties = z.infer<typeof OfferSteppV1ExtractionPropertiesSchema>;
