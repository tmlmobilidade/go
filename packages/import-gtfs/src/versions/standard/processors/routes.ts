/* * */

import { type ImportGtfsContext } from '@/shared/init-context.js';
import { parseCsvFile } from '@/shared/parse-csv.js';
import { type GtfsSQLTables } from '@/versions/standard/types.js';
import { type GtfsRoutes, GtfsRoutesSchema } from '@tmlmobilidade/go-types-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/**
 * Processes the routes.txt file from the GTFS dataset.
 * It filters routes based on the previously saved trips.
 * @param context The import GTFS context containing references to SQL tables and other metadata.
 */
export async function processGtfsRoutes(context: ImportGtfsContext<GtfsSQLTables>): Promise<void> {
	try {
		//

		const routesParseTimer = new Timer();

		Logger.info({ message: 'Reading zip entry "routes.txt"...' });

		const parseEachRow = async (data: GtfsRoutes) => {
			// Validate the current row against the proper type
			const validatedData = GtfsRoutesSchema.parse(data);
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
		Logger.error({ error, message: `Error processing "routes.txt" file: ${error.message}` });
		throw new Error('✖︎ Error processing "routes.txt" file.', error);
	}
}
