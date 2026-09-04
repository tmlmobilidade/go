/* * */

import { parse as csvParser } from 'csv-parse';
import fs from 'fs';

/**
 * Parses a CSV file into a stream and calls a callback function for each row.
 * @param filePath The path to the CSV file to parse.
 * @param rowParser A callback function that will be called for each row.
 * @returns A promise that resolves when the stream is closed.
 */
export async function streamCsvFile<T>(filePath: string, rowParser: (rowData: T) => Promise<void>) {
	const parser = csvParser({
		bom: true,
		cast: value => value === '' ? undefined : value,
		columns: true,
		record_delimiter: ['\n', '\r', '\r\n'],
		skip_empty_lines: true,
		skipRecordsWithEmptyValues: true,
		trim: true,
	});
	const fileStream = fs.createReadStream(filePath);
	const stream = fileStream.pipe(parser);
	for await (const rowData of stream) {
		await rowParser(rowData);
	}
}
