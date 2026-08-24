/* * */

import { UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
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

	feed_dates: z
		.object({
			end: UnixTimestampSchema,
			start: UnixTimestampSchema,
		})
		.default({
			end: 0,
			start: 0,
		}),

	search: z
		.string()
		.optional(),

	validity_statuses: z
		.array(PlanValidityStatusSchema)
		.default([]),
});

export type PlanListFilters = z.infer<typeof PlanListFiltersSchema>;
