/* * */

import { z } from 'zod';

/* * */

export const AgenciesListFiltersSchema = z.object({

	search: z
		.string()
		.optional(),

});

/**
 * The filters schema for getting agencies.
 * It is intended for use in the agencies module.
 */
export type AgenciesListFilters = z.infer<typeof AgenciesListFiltersSchema>;
