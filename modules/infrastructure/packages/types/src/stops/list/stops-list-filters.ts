/* * */

import { LifecycleStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const StopsListFiltersSchema = z.object({

	agency_ids: z
		.array(z.string())
		.default([]),

	lifecycle_statuses: z
		.array(LifecycleStatusSchema)
		.default([]),

	location_neighbourhood_ids: z
		.array(z.string())
		.default([]),

	location_primary_ids: z
		.array(z.string())
		.default([]),

	location_secondary_ids: z
		.array(z.string())
		.default([]),

	location_tertiary_ids: z
		.array(z.string())
		.default([]),

});

export type StopsListFilters = z.infer<typeof StopsListFiltersSchema>;
