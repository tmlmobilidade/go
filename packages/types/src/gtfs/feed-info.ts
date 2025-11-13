/* * */

import { operationalDateSchema } from '@/_common/operational-date.js';
import { z } from 'zod';

/* * */

export const GtfsFeedInfoSchema = z.object({
	default_lang: z.string().nullish(),
	feed_contact_email: z.string().nullish(),
	feed_contact_url: z.string().nullish(),
	feed_end_date: operationalDateSchema.nullish(),
	feed_lang: z.string(),
	feed_publisher_name: z.string().nullish(),
	feed_publisher_url: z.string().nullish(),
	feed_start_date: operationalDateSchema.nullish(),
	feed_version: z.string().nullish(),
});

export type GtfsFeedInfo = z.infer<typeof GtfsFeedInfoSchema>;
