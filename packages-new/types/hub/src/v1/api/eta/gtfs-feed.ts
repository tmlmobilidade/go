/* * */

import { GtfsRtFeedMessageSchema } from '@tmlmobilidade/go-types-gtfs-rt';
import { type z } from 'zod';

/* * */

export const HubV1ApiEtaGtfsFeedSchema = GtfsRtFeedMessageSchema;

/**
 * GTFS-RT TripUpdate feed for the Hub V1 ETA API (`GET /v1/eta/eta/gtfs`).
 */
export type HubV1ApiEtaGtfsFeed = z.infer<typeof HubV1ApiEtaGtfsFeedSchema>;
