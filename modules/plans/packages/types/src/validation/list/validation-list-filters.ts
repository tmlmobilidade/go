/* * */

import { ProcessingStatusSchema, ValidityStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const ValidationListFiltersSchema = z.object({
	agency_ids: z
		.array(z.string())
		.default([]),

	processing_statuses: z
		.array(ProcessingStatusSchema)
		.default([]),

	search: z
		.string()
		.optional(),

	validity_statuses: z
		.array(ValidityStatusSchema)
		.default([]),
});

export type ValidationListFilters = z.infer<typeof ValidationListFiltersSchema>;
