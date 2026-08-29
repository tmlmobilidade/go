/* * */

import { OperationalStatusSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const AlertsRidesFiltersSchema = z.object({

	agency_id: z.string(),

	operational_statuses: z
		.array(OperationalStatusSchema)
		.optional(),

	route_short_names: z
		.array(z.string())
		.optional(),

	search: z
		.string()
		.optional(),

	shape_ids: z
		.array(z.string())
		.optional(),

	start_time_scheduled_end: UnixMillisecondsSchema,

	start_time_scheduled_start: UnixMillisecondsSchema,

});

/**
 * The filters schema for getting rides for alerts.
 * It is intended for use in the alerts module.
 */
export type AlertsRidesFilters = z.infer<typeof AlertsRidesFiltersSchema>;
