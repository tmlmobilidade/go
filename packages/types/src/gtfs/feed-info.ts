/* * */

import { OperationalDateSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const GtfsFeedInfoSchema = z.object({
	default_lang: z.string().nullish(),
	feed_contact_email: z.string().nullish(),
	feed_contact_url: z.string().nullish(),
	feed_end_date: OperationalDateSchema.nullish(),
	feed_lang: z.string(),
	feed_publisher_name: z.string().nullish(),
	feed_publisher_url: z.string().nullish(),
	feed_start_date: OperationalDateSchema.nullish(),
	feed_version: z.string().nullish(),
});

export type GtfsFeedInfo = z.infer<typeof GtfsFeedInfoSchema>;
