/* * */

import { OperationalDateIntSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const EventRideOpportunitieschema = z.object({
	agency_id: z.string(),
	trip_id: z.string(),
	window_start: UnixMillisecondsSchema,
	window_end: UnixMillisecondsSchema,
	operational_dates: z.array(OperationalDateIntSchema),
	generated_at: UnixMillisecondsSchema,
});

/**
 * This represents an intermediate schema for matching vehicle events to rides, before the actual matching is done. 
 * the window_start and window_end are the `event.created_at` ± the `std_window` (defined in `Dates.standardWindowMilliseconds`)
 * which will be used to match the vehicle event to the ride's `start_time_scheduled` and `end_time_scheduled`.
 */
export type EventRideOpportunity = z.infer<typeof EventRideOpportunitieschema>;