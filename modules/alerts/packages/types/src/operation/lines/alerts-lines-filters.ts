/* * */

import { UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const AlertsLinesFiltersSchema = z.object({

	agency_id: z.string(),

	start_time_scheduled_end: UnixTimestampSchema,

	start_time_scheduled_start: UnixTimestampSchema,

});

/**
 * The filters schema for getting lines for alerts.
 * It is intended for use in the alerts module.
 */
export type AlertsLinesFilters = z.infer<typeof AlertsLinesFiltersSchema>;
