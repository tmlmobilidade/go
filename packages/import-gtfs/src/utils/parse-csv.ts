/* * */

import { parse as csvParser } from 'csv-parse';
import fs from 'fs';

/* * */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function parseCsvFile(filePath: string, rowParser: (rowData: any) => Promise<void>) {
	const parser = csvParser({ bom: true, columns: true, record_delimiter: ['\n', '\r', '\r\n'], skip_empty_lines: true, trim: true });
	const fileStream = fs.createReadStream(filePath);
	const stream = fileStream.pipe(parser);
	for await (const rowData of stream) {
		await rowParser(rowData);
	}
}
