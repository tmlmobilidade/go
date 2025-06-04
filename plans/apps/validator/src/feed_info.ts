// Extract feed info from a GTFS file
import { GtfsFeedInfo } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';
import AdmZip from 'adm-zip';
import { parse } from 'csv-parse/sync';

/**
 * Unzips GTFS zip file and returns parsed JSON of feed_info.txt
 * @param {string} zipPath - Path to the GTFS zip file
 * @returns {Promise<GtfsFeedInfo[]>} - Parsed JSON content of feed_info.txt
 */
export async function extractFeedInfo(zipPath: string): Promise<GtfsFeedInfo[]> {
	const zip = new AdmZip(zipPath);
	const feedInfoEntry = zip.getEntry('feed_info.txt');

	if (!feedInfoEntry) {
		throw new Error('feed_info.txt not found in the GTFS zip file');
	}

	const feedInfoCsv = feedInfoEntry.getData().toString('utf8');
	const records: GtfsFeedInfo[] = parse(feedInfoCsv, {
		cast: (value, context) => {
			if (context.header) return value;
			if (context.column === 'feed_start_date' || context.column === 'feed_end_date') return Dates.fromOperationalDate(value, 'Europe/Lisbon').unix_timestamp;
			return value;
		},
		columns: true, // Convert rows to objects using headers
		skip_empty_lines: true,
	});

	return records;
}
