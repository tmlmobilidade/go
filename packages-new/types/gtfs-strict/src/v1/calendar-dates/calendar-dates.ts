/* * */

import { GtfsBinarySchema, GtfsCalendarDatesSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const GtfsStrictV1CalendarDatesSchema = GtfsCalendarDatesSchema.extend({
	day_type: GtfsStrictV1DayTypeSchema,
	holiday: GtfsBinarySchema,
	period: GtfsStrictV1PeriodSchema,
});

/**
 * Represents a calendar date exception in the GTFS format.
 * A calendar date exception indicates a specific date when a service
 * is either added or removed from the schedule.
 * This is used to override the regular calendar for a specific date.
 * GTFS also supports using only this method for defining dates for services.
 */
export type GtfsCalendarDates = z.infer<typeof GtfsCalendarDatesSchema>;

