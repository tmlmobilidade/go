/* * */

import { GtfsCalendarDatesSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const HubGtfsExportCalendarDatesSchema = GtfsCalendarDatesSchema;

/**
 * Representation of a GTFS calendar date for the Hub GTFS export.
 */
export type HubGtfsExportCalendarDates = z.infer<typeof HubGtfsExportCalendarDatesSchema>;
