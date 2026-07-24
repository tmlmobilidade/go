import { Files } from '@tmlmobilidade/files';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { Attachment, OperationalDate } from '@tmlmobilidade/types';
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
export async function updateFeedInfoDates(fileId: string, feedStartDate?: OperationalDate, feedEndDate?: OperationalDate): Promise<{ file: NodeFile, info: Attachment }> {
	if (!fileId) {
		throw new Error('File ID is required to update dates');
	}

	if (!feedStartDate && !feedEndDate) {
		throw new Error('At least one date (start or end) must be provided to update');
	}

	// Get the file info
	const fileInfo = await storageProvider.findById(fileId);

	// Get the file content
	const filesZip = await Files.unzip(fileInfo.url);
	const feedInfoCsv = await filesZip.file('feed_info.txt')?.async('string');

	// Parse the feed info csv
	const feedInfoCsvUpdated = await Files.updateCsvField([
		{
			column: 'feed_start_date',
			csvString: feedInfoCsv,
			rowIndex: 0,
			value: feedStartDate,
		},
		{
			column: 'feed_end_date',
			csvString: feedInfoCsv,
			rowIndex: 0,
			value: feedEndDate,
		},
	]);

	// Zip all files
	filesZip.file('feed_info.txt', feedInfoCsvUpdated);

	const filesZipUpdated = await filesZip.generateAsync({ compression: 'DEFLATE', compressionOptions: { level: 9 }, type: 'blob' });

	return {
		file: Files.blobToFile(filesZipUpdated, fileInfo.name),
		info: fileInfo,
	};
}
