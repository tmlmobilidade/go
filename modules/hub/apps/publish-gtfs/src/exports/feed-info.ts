/* eslint-disable perfectionist/sort-objects */
/* eslint-disable perfectionist/sort-interfaces */

import { type ExportGtfsContext } from '@/types/context.js';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export interface ExportedFeedInfoRow {
	feed_version: string
	feed_start_date: OperationalDateInt
	feed_end_date: OperationalDateInt
	feed_publisher_name: 'TML - Transportes Metropolitanos de Lisboa'
	feed_publisher_url: 'https://tmlmobilidade.pt'
	feed_contact_email: 'go@tmlmobilidade.pt'
	feed_contact_url: 'https://go.tmlmobilidade.pt'
	feed_lang: 'pt'
	default_lang: 'pt'
}

/**
 * Export the feed_info.txt file.
 * @param startDate The feed start date.
 * @param endDate The feed end date.
 * @param context The export context.
 */
export async function exportFeedInfoFile(startDate: OperationalDateInt, endDate: OperationalDateInt, context: ExportGtfsContext) {
	//

	const timer = new Timer();

	Logger.info({ message: 'Exporting feed_info.txt file...' });

	const parsedFeedInfoRow: ExportedFeedInfoRow = {
		feed_version: context.run_id,
		feed_start_date: startDate,
		feed_end_date: endDate,
		feed_publisher_name: 'TML - Transportes Metropolitanos de Lisboa',
		feed_publisher_url: 'https://tmlmobilidade.pt',
		feed_contact_email: 'go@tmlmobilidade.pt',
		feed_contact_url: 'https://go.tmlmobilidade.pt',
		feed_lang: 'pt',
		default_lang: 'pt',
	};

	await context.writers.feed_info.write(parsedFeedInfoRow);

	await context.writers.feed_info.flush();

	Logger.success(`Exported feed_info.txt file in ${timer.get()}.`);
}
