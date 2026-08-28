/* * */

import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const GtfsStrictV30FeedInfoSchema = z.object({
	default_lang: z.string(),
	feed_contact_email: z.string(),
	feed_contact_url: z.string(),
	feed_end_date: OperationalDateIntSchema,
	feed_lang: z.string(),
	feed_publisher_name: z.string(),
	feed_publisher_url: z.string(),
	feed_start_date: OperationalDateIntSchema,
	feed_version: z.string(),
});

/**
 * Represents a feed info in the custom GTFS strict v30 format.
 * It enforces certain fields that are optional in the standard GTFS format.
 */
export type GtfsStrictV30FeedInfo = z.infer<typeof GtfsStrictV30FeedInfoSchema>;
