/* * */

import { z } from 'zod';

/* * */

export const PlanValidityStatusSchema = z.enum([
	'active',
	'expired',
	'upcoming',
]);

export type PlanValidityStatus = z.infer<typeof PlanValidityStatusSchema>;

/* * */

export const PlanListFiltersSchema = z.object({

	agency_ids: z
		.array(z.string())
		.default([]),

	search: z
		.string()
		.optional(),

	validity_statuses: z
		.array(PlanValidityStatusSchema)
		.default([]),

});

export type PlanListFilters = z.infer<typeof PlanListFiltersSchema>;
