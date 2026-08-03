/* * */

import { extractGtfsSource } from '@/shared/extract-source.js';
import { type ImportGtfsConfig, initImportGtfsContext } from '@/shared/init-context.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { processGtfsStrictV29CalendarDates } from './processors/calendar-dates.js';
import { processGtfsStrictV29Routes } from './processors/routes.js';
import { processGtfsStrictV29Shapes } from './processors/shapes.js';
import { processGtfsStrictV29StopTimes } from './processors/stop-times.js';
import { processGtfsStrictV29Stops } from './processors/stops.js';
import { processGtfsStrictV29Trips } from './processors/trips.js';
import { initGtfsStrictV29SqlTables } from './tables.js';
import { type GtfsStrictV29SQLTables } from './types.js';

/**
 * Imports GTFS Strict v29 data into the database for a given plan.
 * @param config The configuration for the import process.
 * @param customContext Optional existing context for the import process.
 * @returns The SQL tables containing the imported GTFS data.
 */
export async function importGtfsStrictV29ToDatabase(config: ImportGtfsConfig): Promise<GtfsStrictV29SQLTables> {
	try {
		//

		const globalTimer = new Timer();

		Logger.info({ message: 'Starting GTFS Strict v29 import process...' });

		//
		// Initialize context for the import process.
		// If an initial context is provided, use it, otherwise create a new one.

		const sqlTables = initGtfsStrictV29SqlTables();
		const context = initImportGtfsContext(sqlTables, config);

		//
		// Download and extract the GTFS file.

		await extractGtfsSource(context);

		//
		// Process GTFS files in the correct order

		await processGtfsStrictV29CalendarDates(context);
		await processGtfsStrictV29Trips(context);
		await processGtfsStrictV29Routes(context);
		await processGtfsStrictV29Shapes(context);
		await processGtfsStrictV29Stops(context);
		await processGtfsStrictV29StopTimes(context);

		Logger.success(`Finished importing GTFS Strict v29 to database in ${globalTimer.get()}.`);

		return context.gtfs;

		//
	} catch (error) {
		Logger.error({ error, message: 'Error importing GTFS Strict v29 to database.' });
		throw error;
	}
}
