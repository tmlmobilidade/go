/* * */

import { GtfsExceptionTypeSchema } from '@/calendar-dates/exception-type.js';
import { GtfsDateSchema } from '@/shared/gtfs-date.js';
import { z } from 'zod';

/* * */

export const GtfsCalendarDatesSchema = z.object({
	date: GtfsDateSchema,
	exception_type: GtfsExceptionTypeSchema,
	service_id: z.string(),
});

/**
 * Represents a calendar date exception in the GTFS format.
 * A calendar date exception indicates a specific date when a service
 * is either added or removed from the schedule.
 * This is used to override the regular calendar for a specific date.
 * GTFS also supports using only this method for defining dates for services.
 */
export type GtfsCalendarDates = z.infer<typeof GtfsCalendarDatesSchema>;

