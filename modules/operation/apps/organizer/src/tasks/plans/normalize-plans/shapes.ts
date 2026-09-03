/* * */

import { type Files } from '@tmlmobilidade/go-utils-files';
import { parse as csvParser } from 'csv-parse';
import fs from 'node:fs';
import { join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import Papa from 'papaparse';

/* * */

type CsvRow = Record<string, string>;

type GtfsZipInstance = Awaited<ReturnType<typeof Files.unzip>>;

/* * */

/**
 * Parsing is lossless on purpose: no casting and no trimming, so that every
 * column other than `shape_id` is written back exactly as it was read.
 */
const CSV_PARSER_OPTIONS = {
	bom: true,
	columns: true,
	record_delimiter: ['\n', '\r', '\r\n'],
	skip_empty_lines: true,
};

/**
 * Rows are encoded in batches to keep memory flat on feeds with millions of rows,
 * while still amortizing the cost of each unparse call.
 */
const CSV_ENCODE_BATCH_SIZE = 10_000;

/* * */

/**
 * Streams a CSV entry of the zip archive through the given row mapper,
 * writing the encoded result to the given file path.
 * @returns The number of rows written.
 */
async function rewriteCsvEntry(zipInstance: GtfsZipInstance, entryName: string, targetFilePath: string, rowMapper: (rowData: CsvRow) => CsvRow): Promise<number> {
	//

	const zipEntry = zipInstance.file(entryName);

	if (!zipEntry) throw new Error(`Entry "${entryName}" not found in the zip archive.`);

	let rowCount = 0;

	//
	// Map each row as it comes out of the parser, and yield the encoded CSV
	// in batches. The header is derived from the first mapped row.

	const encodeRows = async function* (rowsIterable: AsyncIterable<CsvRow>) {
		//

		let columns: string[] = [];
		let batch: CsvRow[] = [];

		for await (const rowData of rowsIterable) {
			//

			const mappedRowData = rowMapper(rowData);

			if (rowCount === 0) {
				columns = Object.keys(mappedRowData);
				yield `${Papa.unparse([columns])}\r\n`;
			}

			rowCount++;
			batch.push(mappedRowData);

			if (batch.length >= CSV_ENCODE_BATCH_SIZE) {
				yield `${Papa.unparse(batch, { columns, header: false })}\r\n`;
				batch = [];
			}

			//
		}

		if (batch.length > 0) yield `${Papa.unparse(batch, { columns, header: false })}\r\n`;

		//
	};

	await pipeline(zipEntry.nodeStream(), csvParser(CSV_PARSER_OPTIONS), encodeRows, fs.createWriteStream(targetFilePath));

	return rowCount;

	//
}

/* * */

/**
 * Rewrites the `shape_id` values of trips.txt and shapes.txt to match the `pattern_id`
 * of each trip. Both files are streamed row by row through the given working directory,
 * since a GTFS feed can hold millions of rows.
 * The `pattern_id` column is a TML extension, so feeds without it are left untouched.
 * The rewritten files are added to the archive as read streams, so the working directory
 * must outlive the archive generation.
 * @returns True if the zip archive was updated.
 */
export async function applyPatternIdsAsShapeIds(zipInstance: GtfsZipInstance, workdirPath: string): Promise<boolean> {
	//

	//
	// Rewrite trips.txt, collecting the shape_id to pattern_id mapping
	// that is needed to rewrite shapes.txt afterwards.

	const patternIdByShapeId = new Map<string, string>();

	let hasChanges = false;

	const tripsFilePath = join(workdirPath, 'trips.txt');

	await rewriteCsvEntry(zipInstance, 'trips.txt', tripsFilePath, (tripRow) => {
		//

		const patternId = tripRow.pattern_id;

		if (!patternId) return tripRow;

		if (tripRow.shape_id) patternIdByShapeId.set(tripRow.shape_id, patternId);
		if (tripRow.shape_id !== patternId) hasChanges = true;

		return { ...tripRow, shape_id: patternId };

		//
	});

	if (!hasChanges) return false;

	//
	// Rewrite shapes.txt with the mapping collected from trips.txt.

	const shapesFilePath = join(workdirPath, 'shapes.txt');

	await rewriteCsvEntry(zipInstance, 'shapes.txt', shapesFilePath, (shapesRow) => {
		const patternId = patternIdByShapeId.get(shapesRow.shape_id);
		return patternId ? { ...shapesRow, shape_id: patternId } : shapesRow;
	});

	//
	// Add both rewritten files back into the zip archive.

	zipInstance.file('trips.txt', fs.createReadStream(tripsFilePath));
	zipInstance.file('shapes.txt', fs.createReadStream(shapesFilePath));

	return true;

	//
}
