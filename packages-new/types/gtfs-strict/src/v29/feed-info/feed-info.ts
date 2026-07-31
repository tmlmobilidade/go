/* * */

import { GtfsDateSchema, GtfsFeedInfoSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const GtfsStrictV29FeedInfoSchema = GtfsFeedInfoSchema.extend({
	default_lang: z.string(),
	feed_contact_email: z.string(),
	feed_contact_url: z.string(),
	feed_end_date: GtfsDateSchema,
	feed_lang: z.string(),
	feed_publisher_name: z.string(),
	feed_publisher_url: z.string(),
	feed_start_date: GtfsDateSchema,
	feed_version: z.string(),
});

/**
 * Represents a feed info in the custom GTFS strict v1 format.
 * It enforces certain fields that are optional in the standard GTFS format.
 */
export type GtfsStrictV29FeedInfo = z.infer<typeof GtfsStrictV29FeedInfoSchema>;
