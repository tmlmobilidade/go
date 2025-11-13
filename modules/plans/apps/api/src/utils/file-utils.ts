import { Files } from '@tmlmobilidade/files';
import { files } from '@tmlmobilidade/interfaces';
import { File, OperationalDate } from '@tmlmobilidade/types';
import { File as NodeFile } from 'node:buffer';

/**
 * Takes a string and returns a string with the dates updated
 * @param string - File name to update
 * @returns Updated file name with current datetime
 *
 * @example updateFileName('abc') // abc_modified_YYYYMMDD_HHMM_SS
 */
export function updateFileName(string: string): string {
	const date = new Date().toISOString().replace(/[-:]/g, '');

	return `${string}_modified_${date}`;
}

/**
 * Updates the feed info dates in the feed_info.txt file
 * @param file_id - The ID of the file to update
 * @param feed_start_date - The new feed start date
 * @param feed_end_date - The new feed end date
 * @returns The updated file and the path to the file
 */
export async function updateFeedInfoDates(file_id: string, feed_start_date?: OperationalDate, feed_end_date?: OperationalDate): Promise<{ file: NodeFile, info: File }> {
	if (!file_id) {
		throw new Error('File ID is required to update dates');
	}

	if (!feed_start_date && !feed_end_date) {
		throw new Error('At least one date (start or end) must be provided to update');
	}

	// Get the file info
	const file_info = await files.findById(file_id);

	// Get the file content
	const files_zip = await Files.unzip(file_info.url);
	const feed_info_csv = await files_zip.file('feed_info.txt')?.async('string');

	// Parse the feed info csv
	const feed_info_csv_updated = await Files.updateCsvField([
		{
			column: 'feed_start_date',
			csvString: feed_info_csv,
			rowIndex: 0,
			value: feed_start_date,
		},
		{
			column: 'feed_end_date',
			csvString: feed_info_csv,
			rowIndex: 0,
			value: feed_end_date,
		},
	]);

	// Zip all files
	files_zip.file('feed_info.txt', feed_info_csv_updated);

	const files_zip_updated = await files_zip.generateAsync({ compression: 'DEFLATE', compressionOptions: { level: 9 }, type: 'blob' });

	return {
		file: Files.blobToFile(files_zip_updated, file_info.name),
		info: file_info,
	};
}
