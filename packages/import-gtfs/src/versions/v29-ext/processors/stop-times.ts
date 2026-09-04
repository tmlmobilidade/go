/* * */

import { type ImportGtfsContext } from '@/shared/init-context.js';
import { type GtfsStrictV29ExtSQLTables } from '@/versions/v29-ext/types.js';
import { type GtfsStrictV29ExtStopTimes, GtfsStrictV29ExtStopTimesSchema } from '@tmlmobilidade/go-types-gtfs-strict';
import { streamCsvFile } from '@tmlmobilidade/go-utils-exec';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/**
 * Processes the stop_times.txt file from the GTFS dataset.
 * Only include the stop_times for trips referenced before.
 * Since this is the most resource intensive operation of them all,
 * include the associated stop data right away to avoid another lookup later.
 * @param context The import GTFS context containing references to SQL tables and other metadata.
 */
export async function processGtfsStrictV29ExtStopTimes(context: ImportGtfsContext<GtfsStrictV29ExtSQLTables>): Promise<void> {
	try {
		//

		const stopTimesParseTimer = new Timer();

		Logger.info({ message: 'Reading zip entry "stop_times.txt"...' });

		const parseEachRow = async (data: GtfsStrictV29ExtStopTimes) => {
			// Validate the current row against the proper type
			const validatedData = GtfsStrictV29ExtStopTimesSchema.safeParse(data);
			// Skip if this row's trip_id was not saved before.
			const tripData = context.gtfs.trips.get('trip_id', validatedData.data.trip_id);
			if (!tripData) return;
			// Also, check if the stop_id is valid and was saved before.
			const stopData = context.gtfs.stops.get('stop_id', validatedData.data.stop_id);
			if (!stopData) return;
			// Save the exported row
			context.gtfs.stop_times.write(validatedData.data);
			// Log progress
			if (context.counters.stop_times % 100000 === 0) Logger.info({ message: `Parsed ${context.counters.stop_times} stop_times.txt rows so far (${stopTimesParseTimer.get()})` });
			// Increment the counter
			context.counters.stop_times++;
		};

		//
		// Setup the CSV parsing operation

		await streamCsvFile(`${context.workdir.extract_dir_path}/stop_times.txt`, parseEachRow);

		context.gtfs.stop_times.flush();

		Logger.success(`Finished processing "stop_times.txt": ${context.counters.stop_times} rows saved in ${stopTimesParseTimer.get()}.`, 1);

		//
	} catch (error) {
		Logger.error({ error, message: `Error processing "stop_times.txt" file: ${error.message}` });
		throw new Error('✖︎ Error processing "stop_times.txt" file.', error);
	}
}
