/* * */

import { GtfsFeedInfoSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const HubGtfsExportFeedInfoSchema = GtfsFeedInfoSchema;

/**
 * Representation of a GTFS agency for the Hub GTFS export.
 */
export type HubGtfsExportFeedInfo = z.infer<typeof HubGtfsExportFeedInfoSchema>;
