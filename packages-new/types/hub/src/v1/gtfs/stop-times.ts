/* * */

import { GtfsStopTimesSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const HubV1GtfsStopTimesSchema = GtfsStopTimesSchema;

/**
 * Representation of a GTFS stop time for the Hub V1 GTFS that is being created.
 */
export type HubV1GtfsStopTimesInput = z.input<typeof HubV1GtfsStopTimesSchema>;

/**
 * Representation of a GTFS stop time for the Hub V1 GTFS.
 */
export type HubV1GtfsStopTimes = z.output<typeof HubV1GtfsStopTimesSchema>;
