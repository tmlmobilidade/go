/* * */

import { GtfsCalendarDatesSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const HubGtfsExportCalendarDatesSchema = GtfsCalendarDatesSchema.extend({
	exception_type: z.literal('1'),
});

/**
 * Representation of a GTFS calendar date for the Hub GTFS export that is being created.
 */
export type HubGtfsExportCalendarDatesInput = z.input<typeof HubGtfsExportCalendarDatesSchema>;

/**
 * Representation of a GTFS calendar date for the Hub GTFS export.
 */
export type HubGtfsExportCalendarDates = z.output<typeof HubGtfsExportCalendarDatesSchema>;
