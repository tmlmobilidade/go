/* * */

import { z } from 'zod';

/* * */

export const SchoolsListFiltersSchema = z.object({
	cycles: z
		.array(z.enum(['artistic', 'basic_1', 'basic_2', 'basic_3', 'high_school', 'other', 'pre_school', 'professional', 'special', 'university']))
		.default([]),
	groupings: z
		.array(z.string())
		.default([]),
	municipality_ids: z
		.array(z.string())
		.default([]),
	search: z
		.string()
		.optional(),
});

/**
 * The filters schema for getting alerts.
 * It is intended for use in the alerts module.
 */
export type SchoolsListFilters = z.infer<typeof SchoolsListFiltersSchema>;
