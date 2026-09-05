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
	//

	//
	// Check if the file exists,
	// throw an error if it doesn't.

	await fs.promises.access(filePath);

	//
	// Initialize the CSV parser.

	const parser = csvParser({
		bom: true,
		cast: value => value === '' ? undefined : value,
		columns: true,
		record_delimiter: ['\n', '\r', '\r\n'],
		skip_empty_lines: true,
		skipRecordsWithEmptyValues: true,
		trim: true,
	});

	//
	// Open the file stream and pipe it to the parser,
	// calling the row parser for each row.

	const fileStream = fs.createReadStream(filePath);
	const stream = fileStream.pipe(parser);

	for await (const rowData of stream) {
		await rowParser(rowData);
	}
}
