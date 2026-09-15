/* * */

import { type GtfsFeedInfo } from '@tmlmobilidade/go-types-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { CsvWriter } from '@tmlmobilidade/writers';

import { type ExportHitouchConfig } from '../types/ExportHitouchConfig.js';

/* * */

export async function exportFeedInfoFile(feedInfo: GtfsFeedInfo, exportConfig: ExportHitouchConfig) {
	//
	// Export feed_info.txt file

	const feedInfoCsv = new CsvWriter('feed_info.txt', `${exportConfig.workdir}/feed_info.txt`, { batch_size: 10000 });

	await feedInfoCsv.write(feedInfo);

	await feedInfoCsv.flush();

	Logger.info({ message: 'Exported feed_info.txt file.' });
}
