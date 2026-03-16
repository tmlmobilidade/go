/* * */

import { type ImportGtfsContext } from '@/types.js';
import { parseCsvFile } from '@/utils/parse-csv.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type GTFS_Trip_Extended_Raw, validateGtfsTripExtended } from '@tmlmobilidade/types';

/**
 * Processes the trips.txt file from the GTFS dataset.
 * It filters trips based on the previously saved calendar dates.
 * @param context The import GTFS context containing references to SQL tables and other metadata.
 */
export async function processTripsFile(context: ImportGtfsContext): Promise<void> {
	try {
		//

		const tripsParseTimer = new Timer();

		Logger.info(`Reading zip entry "trips.txt"...`);

		const parseEachRow = async (data: GTFS_Trip_Extended_Raw) => {
			// Validate the current row against the proper type
			const validatedData = validateGtfsTripExtended(data);
			// For each trip, check if the associated service_id was saved
			// in the previous step or not. Include it if yes, skip otherwise.
			if (!context.gtfs.calendar_dates[validatedData.service_id]) return;
			// Save the exported row
			context.gtfs.trips.write(validatedData);
			// Reference the associated entities to filter them later.
			context.referenced_route_ids.add(validatedData.route_id);
			context.referenced_shape_ids.add(validatedData.shape_id);
			// Log progress
			if (context.counters.trips % 10000 === 0) Logger.info(`Parsed ${context.counters.trips} trips.txt rows so far.`);
			// Increment the counter
			context.counters.trips++;
		};

		//
		// Setup the CSV parsing operation

		await parseCsvFile(`${context.workdir.extract_dir_path}/trips.txt`, parseEachRow);

		context.gtfs.trips.flush();

		Logger.success(`Finished processing "trips.txt": ${context.gtfs.trips.size} rows saved in ${tripsParseTimer.get()}.`, 1);

		//
	} catch (error) {
		Logger.error('Error processing "trips.txt" file.', error);
		throw new Error('✖︎ Error processing "trips.txt" file.');
	}
}
