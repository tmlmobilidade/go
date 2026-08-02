/* * */

import { GtfsDateSchema } from '@/shared/gtfs-date.js';
import { z } from 'zod';

/* * */

export const GtfsFeedInfoSchema = z.object({
	default_lang: z.string().optional(),
	feed_contact_email: z.string().optional(),
	feed_contact_url: z.string().optional(),
	feed_end_date: GtfsDateSchema.optional(),
	feed_lang: z.string(),
	feed_publisher_name: z.string().optional(),
	feed_publisher_url: z.string().optional(),
	feed_start_date: GtfsDateSchema.optional(),
	feed_version: z.string().optional(),
});

/**
 * Represents a feed info in the GTFS format.
 * A feed info is a set of information about the feed,
 * such as the publisher name, URL, and version.
 */
export type GtfsFeedInfo = z.infer<typeof GtfsFeedInfoSchema>;
