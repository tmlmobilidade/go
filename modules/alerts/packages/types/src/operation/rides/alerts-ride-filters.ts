/* * */

import { OperationalStatusSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const AlertsRideFiltersSchema = z.object({

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

	start_time_scheduled_end: UnixTimestampSchema,

	start_time_scheduled_start: UnixTimestampSchema,

});

/**
 * The filters schema for getting rides for alerts.
 * It is intended for use in the alerts module.
 */
export type AlertsRideFilters = z.infer<typeof AlertsRideFiltersSchema>;
