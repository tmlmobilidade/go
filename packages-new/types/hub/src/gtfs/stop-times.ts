/* * */

import { GtfsStopTimesSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const HubGtfsExportStopTimesSchema = GtfsStopTimesSchema;

/**
 * Representation of a GTFS stop time for the Hub GTFS export.
 */
export type HubGtfsExportStopTimes = z.infer<typeof HubGtfsExportStopTimesSchema>;
