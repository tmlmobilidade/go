/* * */

import { type ImportGtfsConfig } from '@/shared/config.js';
import { extractGtfsSource } from '@/shared/extract-source.js';
import { initImportGtfsContext } from '@/shared/init-context.js';
import { Logger } from '@tmlmobilidade/logger-logger-backend';
import { Timer } from '@tmlmobilidade/timer';

import { processGtfsStrictV30CalendarDates } from './processors/calendar-dates.js';
import { processGtfsStrictV30Calendar } from './processors/calendar.js';
import { processGtfsStrictV30Routes } from './processors/routes.js';
import { processGtfsStrictV30Shapes } from './processors/shapes.js';
import { processGtfsStrictV30StopTimes } from './processors/stop-times.js';
import { processGtfsStrictV30Stops } from './processors/stops.js';
import { processGtfsStrictV30Trips } from './processors/trips.js';
import { initGtfsStrictV30SqlTables } from './tables.js';
import { type GtfsStrictV30SQLTables } from './types.js';

/**
 * Imports GTFS Strict v30 data into the database for a given plan.
 * @param config The configuration for the import process.
 * @param customContext Optional existing context for the import process.
 * @returns The SQL tables containing the imported GTFS data.
 */
export async function importGtfsStrictV30ToDatabase(config: ImportGtfsConfig): Promise<GtfsStrictV30SQLTables> {
	try {
		//

		const globalTimer = new Timer();

		Logger.info({ message: 'Starting GTFS Strict v30 import process...' });

		//
		// Initialize context for the import process.
		// If an initial context is provided, use it, otherwise create a new one.

		const sqlTables = initGtfsStrictV30SqlTables();
		const context = initImportGtfsContext(sqlTables, config);

		//
		// Download and extract the GTFS file.

		await extractGtfsSource(context);

		//
		// Process GTFS files in the correct order

		await processGtfsStrictV30Calendar(context);
		await processGtfsStrictV30CalendarDates(context);
		await processGtfsStrictV30Trips(context);
		await processGtfsStrictV30Routes(context);
		await processGtfsStrictV30Shapes(context);
		await processGtfsStrictV30Stops(context);
		await processGtfsStrictV30StopTimes(context);

		Logger.success(`Finished importing GTFS Strict v30 to database in ${globalTimer.get()}.`);

		return context.gtfs;

		//
	} catch (error) {
		Logger.error({ error, message: 'Error importing GTFS Strict v30 to database.' });
		throw error;
	}
}
