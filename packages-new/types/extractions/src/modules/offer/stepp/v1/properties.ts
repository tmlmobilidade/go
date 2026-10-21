/* * */

import { OperationalDateSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const OfferGtfsSteppV1ExtractionPropertiesSchema = z.object({

	agency_id: z.string(),

	end_date: OperationalDateSchema,

	lines_exclude: z.array(z.string()).default([]),

	lines_include: z.array(z.string()).default([]),

	lines_mode: z.enum(['all', 'exclude', 'include']).default('all'),

	start_date: OperationalDateSchema,

});

export type OfferGtfsSteppV1ExtractionProperties = z.infer<typeof OfferGtfsSteppV1ExtractionPropertiesSchema>;
