/* * */

import { OperationalDateSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const OfferGtfsSteppV1ExtractionPropertiesSchema = z.object({

	agency_id: z.string(),

	end_date: OperationalDateSchema,

	start_date: OperationalDateSchema,

});

export type OfferGtfsSteppV1ExtractionProperties = z.infer<typeof OfferGtfsSteppV1ExtractionPropertiesSchema>;
