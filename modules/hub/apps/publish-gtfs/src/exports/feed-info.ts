/* * */

import { type GtfsDate } from '@tmlmobilidade/go-types-gtfs';
import { HubGtfsExportFeedInfo, HubGtfsExportFeedInfoSchema } from '@tmlmobilidade/go-types-hub';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { type ExportGtfsContext } from '../types/context.js';

/**
 * Export the feed_info.txt file.
 * @param context The export context.
 * @param startDate The feed start date.
 * @param endDate The feed end date.
 */
export async function exportFeedInfoFile(context: ExportGtfsContext, startDate: GtfsDate, endDate: GtfsDate) {
	//

	const timer = new Timer();

	Logger.info({ message: 'Exporting feed_info.txt file...' });

	const parsedFeedInfoRow: HubGtfsExportFeedInfo = {
		default_lang: 'pt',
		feed_contact_email: 'go@tmlmobilidade.pt',
		feed_contact_url: 'https://go.tmlmobilidade.pt',
		feed_end_date: endDate,
		feed_lang: 'pt',
		feed_publisher_name: 'TML - Transportes Metropolitanos de Lisboa',
		feed_publisher_url: 'https://tmlmobilidade.pt',
		feed_start_date: startDate,
		feed_version: context.run_id,
	};

	const validatedFeedInfoRow = HubGtfsExportFeedInfoSchema.parse(parsedFeedInfoRow);

	await context.writers.feed_info.write(validatedFeedInfoRow);

	await context.writers.feed_info.flush();

	Logger.success(`Exported feed_info.txt file in ${timer.get()}.`);
}
