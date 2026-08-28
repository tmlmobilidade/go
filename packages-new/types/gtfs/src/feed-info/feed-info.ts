/* * */

import { LanguageTagSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { GtfsDateSchema } from '../shared/gtfs-date.js';

/* * */

export const GtfsFeedInfoSchema = z.object({
	default_lang: LanguageTagSchema.default('pt'),
	feed_contact_email: z.string().optional().default(''),
	feed_contact_url: z.string().optional().default(''),
	feed_end_date: GtfsDateSchema,
	feed_lang: z.string(),
	feed_publisher_name: z.string().optional().default(''),
	feed_publisher_url: z.string().optional().default(''),
	feed_start_date: GtfsDateSchema,
	feed_version: z.string().optional().default(''),
});

/**
 * Represents a feed info in the GTFS format.
 * A feed info is a set of information about the feed,
 * such as the publisher name, URL, and version.
 */
export type GtfsFeedInfo = z.infer<typeof GtfsFeedInfoSchema>;
