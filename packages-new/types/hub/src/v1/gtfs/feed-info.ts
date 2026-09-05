/* * */

import { GtfsFeedInfoSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const HubV1GtfsFeedInfoSchema = GtfsFeedInfoSchema;

/**
 * Representation of a GTFS feed info for the Hub V1 GTFS that is being created.
 */
export type HubV1GtfsFeedInfoInput = z.input<typeof HubV1GtfsFeedInfoSchema>;

/**
 * Representation of a GTFS feed info for the Hub V1 GTFS.
 */
export type HubV1GtfsFeedInfo = z.output<typeof HubV1GtfsFeedInfoSchema>;
