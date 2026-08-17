/* * */

import { UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const AlertsStopsListFiltersSchema = z.object({

	agency_ids: z
		.array(z.string())
		.default([]),

	start_time_scheduled_end: UnixTimestampSchema,

	start_time_scheduled_start: UnixTimestampSchema,

});

/**
 * The filters schema for getting stops for alerts.
 * It is intended for use in the alerts module.
 */
export type AlertsStopsListFilters = z.infer<typeof AlertsStopsListFiltersSchema>;
