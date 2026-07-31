/* * */

import { type ImportGtfsContext } from '@/types/context.js';
import { parseCsvFile } from '@/utils/parse-csv.js';
import { type GtfsStrictV29Route, GtfsStrictV29RouteSchema } from '@tmlmobilidade/go-types-gtfs-strict';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/**
 * Processes the routes.txt file from the GTFS dataset.
 * It filters routes based on the previously saved trips.
 * @param context The import GTFS context containing references to SQL tables and other metadata.
 */
export async function processRoutesFile(context: ImportGtfsContext): Promise<void> {
	try {
		//

		const routesParseTimer = new Timer();

		Logger.info({ message: 'Reading zip entry "routes.txt"...' });

		const parseEachRow = async (data: GtfsStrictV29Route) => {
			// Validate the current row against the proper type
			const validatedData = GtfsStrictV29RouteSchema.safeParse(data);
			// For each route, only save the ones referenced
			// by the previously saved trips.
			if (!context.referenced_route_ids.has(validatedData.data.route_id)) return;
			// Save the exported row
			context.gtfs.routes.write(validatedData.data);
		};

		//
		// Setup the CSV parsing operation

		await parseCsvFile(`${context.workdir.extract_dir_path}/routes.txt`, parseEachRow);

		context.gtfs.routes.flush();

		Logger.success(`Finished processing "routes.txt": ${context.gtfs.routes.size} rows saved in ${routesParseTimer.get()}.`, 1);

		//
	} catch (error) {
		Logger.error({ error, message: `Error processing "routes.txt" file: ${error.message}` });
		throw new Error('✖︎ Error processing "routes.txt" file.', error);
	}
}
