/* * */

import { OperationalDateIntSchema, ProcessingStatusSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RideMatchSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	trip_id: z.string(),
	window_start: UnixMillisecondsSchema,
	window_end: UnixMillisecondsSchema,
	operational_dates: z.array(OperationalDateIntSchema),
	processing_status: ProcessingStatusSchema.default('waiting'),
	updated_at: UnixMillisecondsSchema,
});

/**
 * Intermediate window used to match vehicle/apex events to rides.
 * `window_start`/`window_end` are `event.created_at` ± `std_window`
 * (`Dates.standardWindowMilliseconds`), matched against the ride's
 * `start_time_scheduled`.
 */
export type RideMatch = z.infer<typeof RideMatchSchema>;
