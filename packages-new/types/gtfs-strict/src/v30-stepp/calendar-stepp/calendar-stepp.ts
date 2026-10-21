/* * */

import { GtfsBinarySchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const GtfsStrictV30SteppCalendarSteppSchema = z.object({
	friday_holiday: GtfsBinarySchema,
	monday_holiday: GtfsBinarySchema,
	saturday_holiday: GtfsBinarySchema,
	service_id: z.string(),
	sunday_holiday: GtfsBinarySchema,
	thursday_holiday: GtfsBinarySchema,
	tuesday_holiday: GtfsBinarySchema,
	wednesday_holiday: GtfsBinarySchema,
});

/**
 * Represents a calendar in the GTFS Strict v30 STEPP format.
 * A calendar defines the days of the week on which a particular service is available and if it is a holiday.
 */
export type GtfsStrictV30SteppCalendarStepp = z.infer<typeof GtfsStrictV30SteppCalendarSteppSchema>;
