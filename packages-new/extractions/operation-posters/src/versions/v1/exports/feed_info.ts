/* * */

import { type GtfsFeedInfo } from '@tmlmobilidade/go-types-gtfs';
import { Logger } from '@tmlmobilidade/logger';

import { type OperationPostersV1Context } from '../types/context.js';

/* * */

export async function exportFeedInfoFile(context: OperationPostersV1Context, feedInfo: GtfsFeedInfo) {
	//
	// Export feed_info.txt file

	await context.writers.feed_info.write(feedInfo);

	await context.writers.feed_info.flush();

	Logger.info({ message: 'Exported feed_info.txt file.' });
}
