/* * */

import { GtfsStopTimesSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const HubGtfsExportStopTimesSchema = GtfsStopTimesSchema;

/**
 * Representation of a GTFS stop time for the Hub GTFS export that is being created.
 */
export type HubGtfsExportStopTimesInput = z.input<typeof HubGtfsExportStopTimesSchema>;

/**
 * Representation of a GTFS stop time for the Hub GTFS export.
 */
export type HubGtfsExportStopTimes = z.output<typeof HubGtfsExportStopTimesSchema>;
