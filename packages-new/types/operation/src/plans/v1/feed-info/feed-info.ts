/* * */

import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const OperationPostersV1FeedInfoSchema = z.object({
	default_lang: z.string().default('pt'),
	feed_contact_email: z.string().default(''),
	feed_contact_url: z.string().default(''),
	feed_end_date: OperationalDateIntSchema,
	feed_lang: z.string(),
	feed_publisher_name: z.string(),
	feed_publisher_url: z.string(),
	feed_start_date: OperationalDateIntSchema,
	feed_version: z.string().default(''),
});

export type OperationPostersV1FeedInfo = z.output<typeof OperationPostersV1FeedInfoSchema>;
