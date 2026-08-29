/* * */

import { UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const AlertsStopsFiltersSchema = z.object({

	agency_id: z.string(),

	start_time_scheduled_end: UnixMillisecondsSchema,

	start_time_scheduled_start: UnixMillisecondsSchema,

});

/**
 * The filters schema for getting stops for alerts.
 * It is intended for use in the alerts module.
 */
export type AlertsStopsFilters = z.infer<typeof AlertsStopsFiltersSchema>;
