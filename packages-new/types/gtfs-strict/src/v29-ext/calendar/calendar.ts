/* * */

import { GtfsBinarySchema, GtfsDateSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const GtfsStrictV29ExtCalendarSchema = z.object({
	end_date: GtfsDateSchema,
	friday: GtfsBinarySchema,
	monday: GtfsBinarySchema,
	saturday: GtfsBinarySchema,
	service_id: z.string(),
	start_date: GtfsDateSchema,
	sunday: GtfsBinarySchema,
	thursday: GtfsBinarySchema,
	tuesday: GtfsBinarySchema,
	wednesday: GtfsBinarySchema,
});

/**
 * Represents a calendar in the GTFS Strict v29 Ext format.
 * A calendar defines the days of the week on which a particular service is available,
 * along with the start and end dates of the service period.
 */
export type GtfsStrictV29ExtCalendar = z.infer<typeof GtfsStrictV29ExtCalendarSchema>;
