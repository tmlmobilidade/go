/* * */

import { type ImportGtfsConfig } from '@/shared/config.js';
import { extractGtfsSource } from '@/shared/extract-source.js';
import { initImportGtfsContext } from '@/shared/init-context.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { processGtfsHubV1CalendarDates } from './processors/calendar-dates.js';
import { processGtfsHubV1Routes } from './processors/routes.js';
import { processGtfsHubV1Shapes } from './processors/shapes.js';
import { processGtfsHubV1StopTimes } from './processors/stop-times.js';
import { processGtfsHubV1Stops } from './processors/stops.js';
import { processGtfsHubV1Trips } from './processors/trips.js';
import { initGtfsHubV1SqlTables } from './tables.js';
import { type GtfsHubV1SQLTables } from './types.js';

/**
 * Imports GTFS Strict v30 data into the database for a given plan.
 * @param config The configuration for the import process.
 * @param customContext Optional existing context for the import process.
 * @returns The SQL tables containing the imported GTFS data.
 */
export async function importGtfsHubV1ToDatabase(config: ImportGtfsConfig): Promise<GtfsHubV1SQLTables> {
	try {
		//

		const globalTimer = new Timer();

		Logger.info({ message: 'Starting GTFS Strict v30 import process...' });

		//
		// Initialize context for the import process.
		// If an initial context is provided, use it, otherwise create a new one.

		const sqlTables = initGtfsHubV1SqlTables();
		const context = initImportGtfsContext(sqlTables, config);

		//
		// Download and extract the GTFS file.

		await extractGtfsSource(context);

		//
		// Process GTFS files in the correct order

		await processGtfsHubV1CalendarDates(context);
		await processGtfsHubV1Trips(context);
		await processGtfsHubV1Routes(context);
		await processGtfsHubV1Shapes(context);
		await processGtfsHubV1Stops(context);
		await processGtfsHubV1StopTimes(context);

		Logger.success(`Finished importing GTFS Strict v30 to database in ${globalTimer.get()}.`);

		return context.gtfs;

		//
	} catch (error) {
		Logger.error({ error, message: 'Error importing GTFS Strict v30 to database.' });
		throw error;
	}
}
