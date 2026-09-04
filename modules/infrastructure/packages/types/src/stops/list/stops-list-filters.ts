/* * */

import { LifecycleStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const StopsListFiltersSchema = z.object({

	agency_ids: z
		.array(z.string())
		.default([]),

	district_ids: z
		.array(z.string())
		.default([]),

	lifecycle_statuses: z
		.array(LifecycleStatusSchema)
		.default([]),

	locality_ids: z
		.array(z.string())
		.default([]),

	municipality_ids: z
		.array(z.string())
		.default([]),

	parish_ids: z
		.array(z.string())
		.default([]),

});

export type StopsListFilters = z.infer<typeof StopsListFiltersSchema>;
