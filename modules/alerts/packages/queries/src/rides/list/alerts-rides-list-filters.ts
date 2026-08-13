/* * */

import { UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const ControllerRidesListFiltersSchema = z.object({

	agency_ids: z.array(z.string()),

	start_time_scheduled_end: UnixTimestampSchema,

	start_time_scheduled_start: UnixTimestampSchema,

});

/**
 * The filters schema for getting rides.
 * It is intended for use in the controller module.
 */
export type ControllerRidesListFilters = z.infer<typeof ControllerRidesListFiltersSchema>;
