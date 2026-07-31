/* * */

import { GtfsStrictV29DayTypeSchema } from '@/v29/calendar-dates/day-type.js';
import { GtfsStrictV29PeriodSchema } from '@/v29/calendar-dates/period.js';
import { GtfsBinarySchema, GtfsCalendarDatesSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const GtfsStrictV29CalendarDatesSchema = GtfsCalendarDatesSchema.extend({
	day_type: GtfsStrictV29DayTypeSchema,
	holiday: GtfsBinarySchema,
	period: GtfsStrictV29PeriodSchema,
});

/**
 * Represents a calendar date exception in the GTFS strict v1 format.
 * A calendar date exception indicates a specific date when a service
 * is either added or removed from the schedule.
 * This is used to override the regular calendar for a specific date.
 * GTFS strict v1 also supports using only this method for defining dates for services.
 */
export type GtfsStrictV29CalendarDates = z.infer<typeof GtfsStrictV29CalendarDatesSchema>;

