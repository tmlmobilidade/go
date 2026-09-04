/* * */

import { UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const AlertsLinesFiltersSchema = z.object({

	agency_id: z.string(),

	start_time_scheduled_end: UnixMillisecondsSchema,

	start_time_scheduled_start: UnixMillisecondsSchema,

});

/**
 * The filters schema for getting lines for alerts.
 * It is intended for use in the alerts module.
 */
export type AlertsLinesFilters = z.infer<typeof AlertsLinesFiltersSchema>;
