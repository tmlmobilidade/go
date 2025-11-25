/* eslint-disable perfectionist/sort-objects */

import { type MergedGtfsExportConfig } from '@/types.js';
import { Logger } from '@tmlmobilidade/logger';
import { type OperationalDate } from '@tmlmobilidade/types';

/* * */

interface ExportedDatesRow {
	date: OperationalDate
	day_type: 1 | 2 | 3
	holiday: 0 | 1
	notes: string
	period: 1 | 2 | 3
}

/**
 * Export the feed_info.txt file.
 * @param startDate The feed start date.
 * @param endDate The feed end date.
 * @param exportConfig The export configuration.
 */
export async function exportDatesFile(exportConfig: MergedGtfsExportConfig) {
	//

	const parsedFeedInfoRow: ExportedDatesRow = {
		date: exportConfig.startDate,
		day_type: 1,
		period: 1,
		holiday: 0,
		notes: 'Início do período de validade do feed.',
	};

	await exportConfig.writers.feed_info.write(parsedFeedInfoRow);

	await exportConfig.writers.feed_info.flush();

	Logger.info('Exported feed_info.txt file.');
}
