/* * */

import { GtfsFeedInfoSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const HubGtfsExportFeedInfoSchema = GtfsFeedInfoSchema;

/**
 * Representation of a GTFS feed info for the Hub GTFS export that is being created.
 */
export type HubGtfsExportFeedInfoInput = z.input<typeof HubGtfsExportFeedInfoSchema>;

/**
 * Representation of a GTFS feed info for the Hub GTFS export.
 */
export type HubGtfsExportFeedInfo = z.output<typeof HubGtfsExportFeedInfoSchema>;
