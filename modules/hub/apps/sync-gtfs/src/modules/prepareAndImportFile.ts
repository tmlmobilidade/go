/* * */

import { GtfsFile } from '@/config/files.js';
import { getGtfsSqliteContext } from '@/modules/gtfsSqlite.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { BatchWriter } from '@tmlmobilidade/utils';
import { parse } from 'csv-parse';
import fs from 'node:fs';
import Papa from 'papaparse';

/* * */

export default async function (preparedDirPath: string, rawFilePath: string, gtfsFile: GtfsFile) {
	//

	Logger.info(`Importing "${gtfsFile._key}"...`);

	const globalTimer = new Timer();
	const gtfsSqlite = getGtfsSqliteContext();
	const gtfsTable = gtfsSqlite.tables.get(gtfsFile._key);

	if (!gtfsTable) {
		throw new Error(`Could not find SQLite table "${gtfsFile._key}".`);
	}

	//
	// Clear table before writing new GTFS rows.
	// Table schema/indexes are created during SQLite context initialization.

	const rebuildTableTimer = new Timer();

	gtfsTable.clear();

	Logger.success(`Rebuilt "${gtfsFile._key}" SQL table (${rebuildTableTimer.get()})`);

	//
	// Setup a new instance of the batch CSV writer as well as path variables
	// used across this function. Using a batch writer avoids memory issues (instead of loading the entire file into memory)
	// as well as improves performance because it reduces the amount of disk operations (instead of saving line by line).

	const preparedFilePath = `${preparedDirPath}/${gtfsFile._key}.${gtfsFile.extension}`;

	/* * */

	const csvWriter = new BatchWriter({
		batch_size: 1_000_000,
		insertFn: async (data) => {
			// Keep track if the file exists or not
			const fileAlreadyExists = fs.existsSync(preparedFilePath);
			// Use papaparse to produce the CSV string
			let csvData = Papa.unparse(data, { header: !fileAlreadyExists, newline: '\n', skipEmptyLines: 'greedy' });
			// Prepend BOM if this is the first write and BOM is enabled
			if (!fileAlreadyExists) {
				csvData = '\uFEFF' + csvData;
			}
			// Prepend a new line character to csvData string
			// if it is not the first line on the file.
			if (fileAlreadyExists) {
				csvData = '\n' + csvData;
			}
			// Recurseively ensure that the directory
			// for the file path exists.
			const dirPath = preparedFilePath.substring(0, preparedFilePath.lastIndexOf('/'));
			if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
			// Append the csv string to the file
			fs.appendFileSync(preparedFilePath, csvData, { encoding: 'utf-8', flush: true });
		},
		title: gtfsFile._key,
	});

	// const csvWriter = new CsvWriter(gtfsFile._key, preparedFilePath, { batch_size: 1000000 });

	//
	// Prepare the file.
	// To do this, we read the raw file using csv-parse library (because it allows streaming),
	// then we transform the file to exactly match the table format (including column order),
	// and then we save it to a new file in the prepared directory using a batch writer.

	const prepareFileTimer = new Timer();

	const rawFileStream = fs.createReadStream(rawFilePath).pipe(parse({ bom: true, columns: true, ignore_last_delimiters: true, skip_empty_lines: true, trim: true }));

	let preparedRowsCount = 0;

	for await (const rawFileRow of rawFileStream) {
		const preparedFileRow = {};
		gtfsFile.headers.forEach((headerKey) => {
			preparedFileRow[headerKey] = rawFileRow[headerKey];
		});
		await csvWriter.write(preparedFileRow);
		preparedRowsCount++;
	}

	await csvWriter.flush();

	Logger.success(`Prepared "${gtfsFile._key}" file (${preparedRowsCount} rows in ${prepareFileTimer.get()})`);

	//
	// Import prepared rows into SQLite table in batches.

	const importFileTimer = new Timer();

	const preparedFileReadStream = fs.createReadStream(preparedFilePath).pipe(parse({ bom: true, columns: true, ignore_last_delimiters: true, skip_empty_lines: true, trim: true }));

	let importedRowsCount = 0;
	for await (const preparedRow of preparedFileReadStream) {
		gtfsTable.write(preparedRow);
		importedRowsCount++;
	}

	gtfsTable.flush();

	Logger.success(`Imported "${gtfsFile._key}" file to SQLite (${importedRowsCount} rows in ${importFileTimer.get()})`);

	//

	Logger.success(`Prepare and Import complete for "${gtfsFile._key}" file (${globalTimer.get()})`);

	//
}
