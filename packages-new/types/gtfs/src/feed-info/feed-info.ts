/* * */

import { LanguageTagSchema, nullAsUndefined, OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const GtfsFeedInfoSchema = z.object({
	default_lang: nullAsUndefined(LanguageTagSchema.default('pt')),
	feed_contact_email: nullAsUndefined(z.string().optional().default('')),
	feed_contact_url: nullAsUndefined(z.string().optional().default('')),
	feed_end_date: OperationalDateIntSchema,
	feed_lang: nullAsUndefined(z.string()),
	feed_publisher_name: nullAsUndefined(z.string().optional().default('')),
	feed_publisher_url: nullAsUndefined(z.string().optional().default('')),
	feed_start_date: OperationalDateIntSchema,
	feed_version: nullAsUndefined(z.string().optional().default('')),
});

/**
 * Represents a feed info in the GTFS format.
 * A feed info is a set of information about the feed,
 * such as the publisher name, URL, and version.
 */
export type GtfsFeedInfo = z.infer<typeof GtfsFeedInfoSchema>;
