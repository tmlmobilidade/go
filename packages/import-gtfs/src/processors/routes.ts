/* * */

import { type ImportGtfsContext } from '@/types.js';
import { parseCsvFile } from '@/utils/parse-csv.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type GTFS_Route_Extended_Raw, validateGtfsRouteExtended } from '@tmlmobilidade/types';

/**
 * Processes the routes.txt file from the GTFS dataset.
 * It filters routes based on the previously saved trips.
 * @param context The import GTFS context containing references to SQL tables and other metadata.
 */
export async function processRoutesFile(context: ImportGtfsContext): Promise<void> {
	try {
		//

		const routesParseTimer = new Timer();

		Logger.info(`Reading zip entry "routes.txt"...`);

		const parseEachRow = async (data: GTFS_Route_Extended_Raw) => {
			// Validate the current row against the proper type
			const validatedData = validateGtfsRouteExtended(data);
			// For each route, only save the ones referenced
			// by the previously saved trips.
			if (!context.referenced_route_ids.has(validatedData.route_id)) return;
			// Save the exported row
			context.gtfs.routes.write(validatedData);
		};

		//
		// Setup the CSV parsing operation

		await parseCsvFile(`${context.workdir.extract_dir_path}/routes.txt`, parseEachRow);

		context.gtfs.routes.flush();

		Logger.success(`Finished processing "routes.txt": ${context.gtfs.routes.size} rows saved in ${routesParseTimer.get()}.`, 1);

		//
	} catch (error) {
		Logger.error('Error processing "routes.txt" file.', error);
		throw new Error('✖︎ Error processing "routes.txt" file.');
	}
}
