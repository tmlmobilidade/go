/* * */

import { GtfsExceptionTypeSchema } from '@tmlmobilidade/go-types-gtfs';
import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const GtfsStrictV30CalendarDatesSchema = z.object({
	date: OperationalDateIntSchema,
	exception_type: GtfsExceptionTypeSchema,
	service_id: z.string(),
});

/**
 * Represents a calendar date exception in the GTFS Strict v30 format.
 * A calendar date exception indicates a specific date when a service
 * is either added or removed from the schedule.
 * This is used to override the regular calendar for a specific date.
 * GTFS Strict v30 also supports using only this method for defining dates for services.
 */
export type GtfsStrictV30CalendarDates = z.infer<typeof GtfsStrictV30CalendarDatesSchema>;

