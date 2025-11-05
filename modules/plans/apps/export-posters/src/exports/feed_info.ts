/* * */

import { type ExportToHitouchConfig } from '@/types.js';
import { type Plan } from '@go/types';
import { Logger } from '@go/logger';
import { CsvWriter } from '@helperkits/writer';

/* * */

export async function exportFeedInfoFile(planData: Plan, exportConfig: ExportToHitouchConfig) {
	//
	// Export feed_info.txt file

	const feedInfoCsv = new CsvWriter('feed_info.txt', `${exportConfig.workdir}/feed_info.txt`, { batch_size: 10000 });

	await feedInfoCsv.write(planData.gtfs_feed_info);

	await feedInfoCsv.flush();

	Logger.info('Exported feed_info.txt file.');
}
