/* eslint-disable perfectionist/sort-objects */
/* eslint-disable perfectionist/sort-interfaces */

import { type ExportGtfsContext } from '@/types/context.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
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
 * @param context The export context.
 */
export async function exportFeedInfoFile(startDate: OperationalDate, endDate: OperationalDate, context: ExportGtfsContext) {
	//

	const timer = new Timer();

	Logger.info('Exporting feed_info.txt file...');

	const parsedFeedInfoRow: ExportedFeedInfoRow = {
		feed_version: context.run_id,
		feed_start_date: startDate,
		feed_end_date: endDate,
		feed_publisher_name: 'TML - Transportes Metropolitanos de Lisboa',
		feed_publisher_url: 'https://tmlmobilidade.pt',
		feed_contact_email: 'iso@tmlmobilidade.pt',
		feed_contact_url: 'https://tmlmobilidade.pt',
		feed_lang: 'pt',
		default_lang: 'pt',
	};

	await context.writers.feed_info.write(parsedFeedInfoRow);

	await context.writers.feed_info.flush();

	Logger.success(`Exported feed_info.txt file in ${timer.get()}.`);
}
