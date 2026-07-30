/* * */

import { GtfsStrictV1DayTypeSchema } from '@/v1/calendar-dates/day-type.js';
import { GtfsStrictV1PeriodSchema } from '@/v1/calendar-dates/period.js';
import { GtfsBinarySchema, GtfsCalendarDatesSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const GtfsStrictV1CalendarDatesSchema = GtfsCalendarDatesSchema.extend({
	day_type: GtfsStrictV1DayTypeSchema,
	holiday: GtfsBinarySchema,
	period: GtfsStrictV1PeriodSchema,
});

/**
 * Represents a calendar date exception in the GTFS strict v1 format.
 * A calendar date exception indicates a specific date when a service
 * is either added or removed from the schedule.
 * This is used to override the regular calendar for a specific date.
 * GTFS strict v1 also supports using only this method for defining dates for services.
 */
export type GtfsStrictV1CalendarDates = z.infer<typeof GtfsStrictV1CalendarDatesSchema>;

