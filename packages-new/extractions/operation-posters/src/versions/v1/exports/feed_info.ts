/* * */

import { type OperationPostersV1FeedInfo, OperationPostersV1FeedInfoSchema } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/logger';

import { type OperationPostersV1Context } from '../types/context.js';

/* * */

export async function exportFeedInfoFile(context: OperationPostersV1Context, feedInfo: OperationPostersV1FeedInfo) {
	//
	// Export feed_info.txt file

	await context.writers.feed_info.write(OperationPostersV1FeedInfoSchema.parse(feedInfo));

	await context.writers.feed_info.flush();

	Logger.info({ message: 'Exported feed_info.txt file.' });
}
