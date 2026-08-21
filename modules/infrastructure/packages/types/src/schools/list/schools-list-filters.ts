/* * */

import { z } from 'zod';

/* * */

export const SchoolsListFiltersSchema = z.object({
	search: z
		.string()
		.optional(),
});

/**
 * The filters schema for getting alerts.
 * It is intended for use in the alerts module.
 */
export type SchoolsListFilters = z.infer<typeof SchoolsListFiltersSchema>;
