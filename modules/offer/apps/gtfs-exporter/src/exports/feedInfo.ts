import { GtfsV29ExportConfig } from '@/types.js';
import { getCurrentTimestamp } from '@/utils.js';
import { validateGtfsDate } from '@tmlmobilidade/go-types-gtfs';
import { type GtfsStrictV29FeedInfo } from '@tmlmobilidade/go-types-gtfs-strict';
import { type Agency } from '@tmlmobilidade/types';

/**
 * Parses feed info data into GTFS feed_info.txt format
 * @param agencyData - The agency data
 * @param exportConfig - The export configuration
 * @returns The formatted feed info row
 */
function parseFeedInfo(
	agencyData: Agency,
	exportConfig: GtfsV29ExportConfig,
): GtfsStrictV29FeedInfo {
	try {
		return {
			default_lang: 'en',
			feed_contact_email: 'go@tmlmobilidade.pt',
			feed_contact_url: 'https://api.carrismetropolitana.pt/gtfs',
			feed_end_date: validateGtfsDate(exportConfig.feed_end_date),
			feed_lang: 'pt',
			feed_publisher_name: agencyData.name || 'Carris Metropolitana',
			feed_publisher_url: agencyData.website_url || 'https://www.carrismetropolitana.pt',
			feed_start_date: validateGtfsDate(exportConfig.feed_start_date),
			feed_version: getCurrentTimestamp(),
		};
	} catch (error) {
		throw new Error(`Error parsing feed info: ${error}`, error);
	}
}

/**
 * Exports the feed_info.txt file
 * @param agencyData - The agency data
 * @param exportConfig - The export configuration
 */
export async function exportFeedInfoFile(
	agencyData: Agency,
	exportConfig: GtfsV29ExportConfig,
) {
	const parsedFeedInfo = parseFeedInfo(agencyData, exportConfig);
	await exportConfig.writers.feed_info.write(parsedFeedInfo);
	await exportConfig.writers.feed_info.flush();
}
