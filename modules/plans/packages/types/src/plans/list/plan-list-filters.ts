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

	gtfs_feed_info: z
		.object({
			end_date: UnixTimestampSchema,
			start_date: UnixTimestampSchema,
		})
		.default({
			end_date: 0,
			start_date: 0,
		}),

	search: z
		.string()
		.optional(),

	validity_statuses: z
		.array(PlanValidityStatusSchema)
		.default([]),
});

export type PlanListFilters = z.infer<typeof PlanListFiltersSchema>;
