/* * */

import { UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const OperationLinesListFiltersSchema = z.object({

	agency_ids: z.array(z.string()),

	start_time_scheduled_end: UnixTimestampSchema,

	start_time_scheduled_start: UnixTimestampSchema,

});

/**
 * The filters schema for getting operation lines.
 * It is intended for use in the alerts module.
 */
export type OperationLinesListFilters = z.infer<typeof OperationLinesListFiltersSchema>;
