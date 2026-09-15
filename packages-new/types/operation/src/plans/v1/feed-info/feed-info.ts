/* * */

import { GtfsFeedInfoSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const OperationPostersV1FeedInfoSchema = z.object({
	...GtfsFeedInfoSchema.shape,
});

export type OperationPostersV1FeedInfo = z.output<typeof OperationPostersV1FeedInfoSchema>;
