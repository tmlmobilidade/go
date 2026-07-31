/* * */

import { type ImportGtfsContext } from '@/types/context.js';
import { parseCsvFile } from '@/utils/parse-csv.js';
import { type GtfsStrictV29Trips, GtfsStrictV29TripsSchema } from '@tmlmobilidade/go-types-gtfs-strict';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/**
 * Processes the trips.txt file from the GTFS dataset.
 * It filters trips based on the previously saved calendar dates.
 * @param context The import GTFS context containing references to SQL tables and other metadata.
 */
export async function processTripsFile(context: ImportGtfsContext): Promise<void> {
	try {
		//

		const tripsParseTimer = new Timer();

		Logger.info({ message: 'Reading zip entry "trips.txt"...' });

		const parseEachRow = async (data: GtfsStrictV29Trips) => {
			// Validate the current row against the proper type
			const validatedData = GtfsStrictV29TripsSchema.safeParse(data);
			// For each trip, check if the associated service_id was saved
			// in the previous step or not. Include it if yes, skip otherwise.
			if (!context.gtfs.calendar_dates[validatedData.data.service_id]) return;
			// Save the exported row
			context.gtfs.trips.write(validatedData.data);
			// Reference the associated entities to filter them later.
			context.referenced_route_ids.add(validatedData.data.route_id);
			context.referenced_shape_ids.add(validatedData.data.shape_id);
			// Log progress
			if (context.counters.trips % 10000 === 0) Logger.info({ message: `Parsed ${context.counters.trips} trips.txt rows so far (${tripsParseTimer.get()})` });
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
		Logger.error({ error, message: `Error processing "trips.txt" file: ${error.message}` });
		throw new Error('✖︎ Error processing "trips.txt" file.', error);
	}
}
