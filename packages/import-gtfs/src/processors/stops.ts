/* * */

import { type ImportGtfsContext } from '@/types/context.js';
import { parseCsvFile } from '@/utils/parse-csv.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type GTFS_Stop_Extended_Raw, validateGtfsStopExtended } from '@tmlmobilidade/types';

/**
 * Processes the stops.txt file from the GTFS dataset.
 * include all of them since we don't have a way to filter them yet like trips/routes/shapes.
 * By saving all of them, we also speed up the processing of each stop_time by including the stop data right away.
 * @param context The import GTFS context containing references to SQL tables and other metadata.
 */
export async function processStopsFile(context: ImportGtfsContext): Promise<void> {
	try {
		//

		const stopsParseTimer = new Timer();

		Logger.info(`Reading zip entry "stops.txt"...`);

		const parseEachRow = async (data: GTFS_Stop_Extended_Raw) => {
			// Validate the current row against the proper type
			const validatedData = validateGtfsStopExtended(data);
			// Skip if stop already exists
			if (context.gtfs.stops.get('stop_id', validatedData.stop_id)) return;
			// Save the exported row
			context.gtfs.stops.write(validatedData);
		};

		//
		// Setup the CSV parsing operation

		await parseCsvFile(`${context.workdir.extract_dir_path}/stops.txt`, parseEachRow);

		context.gtfs.stops.flush();

		Logger.success(`Finished processing "stops.txt": ${context.gtfs.stops.size} rows saved in ${stopsParseTimer.get()}.`, 1);

		//
	} catch (error) {
		Logger.error('Error processing "stops.txt" file.', error);
		throw new Error('✖︎ Error processing "stops.txt" file.');
	}
}
