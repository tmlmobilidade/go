/* * */

import { z } from 'zod';

/* * */

export const ValidationListFiltersSchema = z.object({
	agency_ids: z
		.array(z.string())
		.default([]),

	processing_statuses: z
		.array(z.string())
		.default([]),

	search: z
		.string()
		.optional(),

});

export type ValidationListFilters = z.infer<typeof ValidationListFiltersSchema>;
