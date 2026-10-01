/* * */

import { GtfsCalendarDatesSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const HubV1GtfsCalendarDatesSchema = GtfsCalendarDatesSchema.extend({
	exception_type: z.literal('1').default('1'),
});

/**
 * Representation of a GTFS calendar date for the Hub V1 GTFS that is being created.
 */
export type HubV1GtfsCalendarDatesInput = z.input<typeof HubV1GtfsCalendarDatesSchema>;

/**
 * Representation of a GTFS calendar date for the Hub V1 GTFS.
 */
export type HubV1GtfsCalendarDates = z.output<typeof HubV1GtfsCalendarDatesSchema>;
