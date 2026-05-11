/* * */

import { GtfsFile } from '@/config/files.js';
import { getGtfsSqliteContext } from '@/modules/gtfsSqlite.js';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { CsvWriter } from '@helperkits/writer';
import { parse } from 'csv-parse';
import fs from 'node:fs';

/* * */

export default async function (preparedDirPath: string, rawFilePath: string, gtfsFile: GtfsFile) {
	//

	LOGGER.spacer(1);
	LOGGER.info(`Importing "${gtfsFile._key}"...`);

	const globalTimer = new TIMETRACKER();
	const gtfsSqlite = getGtfsSqliteContext();
	const gtfsTable = gtfsSqlite.tables.get(gtfsFile._key);

	if (!gtfsTable) {
		throw new Error(`Could not find SQLite table "${gtfsFile._key}".`);
	}

	//
	// Clear table before writing new GTFS rows.
	// Table schema/indexes are created during SQLite context initialization.

	const rebuildTableTimer = new TIMETRACKER();

	gtfsTable.clear();

	LOGGER.success(`Rebuilt "${gtfsFile._key}" SQL table (${rebuildTableTimer.get()})`);

	//
	// Setup a new instance of the batch CSV writer as well as path variables
	// used across this function. Using a batch writer avoids memory issues (instead of loading the entire file into memory)
	// as well as improves performance because it reduces the amount of disk operations (instead of saving line by line).

	const preparedFilePath = `${preparedDirPath}/${gtfsFile._key}.${gtfsFile.extension}`;

	const csvWriter = new CsvWriter(gtfsFile._key, preparedFilePath, { batch_size: 1000000 });

	//
	// Prepare the file.
	// To do this, we read the raw file using csv-parse library (because it allows streaming),
	// then we transform the file to exactly match the table format (including column order),
	// and then we save it to a new file in the prepared directory using a batch writer.

	const prepareFileTimer = new TIMETRACKER();

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

	LOGGER.success(`Prepared "${gtfsFile._key}" file (${preparedRowsCount} rows in ${prepareFileTimer.get()})`);

	//
	// Import prepared rows into SQLite table in batches.

	const importFileTimer = new TIMETRACKER();

	const preparedFileReadStream = fs.createReadStream(preparedFilePath).pipe(parse({ bom: true, columns: true, ignore_last_delimiters: true, skip_empty_lines: true, trim: true }));

	let importedRowsCount = 0;
	for await (const preparedRow of preparedFileReadStream) {
		gtfsTable.write(preparedRow);
		importedRowsCount++;
	}

	gtfsTable.flush();

	LOGGER.success(`Imported "${gtfsFile._key}" file to SQLite (${importedRowsCount} rows in ${importFileTimer.get()})`);

	//

	LOGGER.success(`Prepare and Import complete for "${gtfsFile._key}" file (${globalTimer.get()})`);

	//
}
