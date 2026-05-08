/* eslint-disable perfectionist/sort-objects */
/* eslint-disable perfectionist/sort-interfaces */

import { type MergedGtfsExportConfig } from '@/types.js';
import { Logger } from '@tmlmobilidade/logger';
import { type OperationalDate } from '@tmlmobilidade/types';

/* * */

export interface ExportedFeedInfoRow {
	feed_version: string
	feed_start_date: OperationalDate
	feed_end_date: OperationalDate
	feed_publisher_name: 'TML - Transportes Metropolitanos de Lisboa'
	feed_publisher_url: 'https://tmlmobilidade.pt'
	feed_contact_email: 'iso@tmlmobilidade.pt'
	feed_contact_url: 'https://tmlmobilidade.pt'
	feed_lang: 'pt'
	default_lang: 'pt'
}

/**
 * Export the feed_info.txt file.
 * @param startDate The feed start date.
 * @param endDate The feed end date.
 * @param exportConfig The export configuration.
 */
export async function exportFeedInfoFile(startDate: OperationalDate, endDate: OperationalDate, exportConfig: MergedGtfsExportConfig) {
	//

	const parsedFeedInfoRow: ExportedFeedInfoRow = {
		feed_version: exportConfig.version,
		feed_start_date: startDate,
		feed_end_date: endDate,
		feed_publisher_name: 'TML - Transportes Metropolitanos de Lisboa',
		feed_publisher_url: 'https://tmlmobilidade.pt',
		feed_contact_email: 'iso@tmlmobilidade.pt',
		feed_contact_url: 'https://tmlmobilidade.pt',
		feed_lang: 'pt',
		default_lang: 'pt',
	};

	await exportConfig.writers.feed_info.write(parsedFeedInfoRow);

	await exportConfig.writers.feed_info.flush();

	Logger.info('Exported feed_info.txt file.');
}
