/* * */

import { GtfsBinarySchema } from '@tmlmobilidade/go-types-gtfs';
import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const GtfsStrictV30CalendarSchema = z.object({
	end_date: OperationalDateIntSchema,
	friday: GtfsBinarySchema,
	monday: GtfsBinarySchema,
	saturday: GtfsBinarySchema,
	service_id: z.string(),
	start_date: OperationalDateIntSchema,
	sunday: GtfsBinarySchema,
	thursday: GtfsBinarySchema,
	tuesday: GtfsBinarySchema,
	wednesday: GtfsBinarySchema,
});

/**
 * Represents a calendar in the GTFS Strict v30 format.
 * A calendar defines the days of the week on which a particular service is available,
 * along with the start and end dates of the service period.
 */
export type GtfsStrictV30Calendar = z.infer<typeof GtfsStrictV30CalendarSchema>;
