/* * */

import { extractGtfsSource } from '@/shared/extract-source.js';
import { type ImportGtfsConfig, initImportGtfsContext } from '@/shared/init-context.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { type GtfsSQLTables, initGtfsSqlTables } from './init-tables.js';
import { processGtfsCalendarDates } from './processors/calendar-dates.js';
import { processGtfsCalendar } from './processors/calendar.js';
import { processGtfsRoutes } from './processors/routes.js';
import { processGtfsShapes } from './processors/shapes.js';
import { processGtfsStopTimes } from './processors/stop-times.js';
import { processGtfsStops } from './processors/stops.js';
import { processGtfsTrips } from './processors/trips.js';

/**
 * Imports GTFS data into the database for a given plan.
 * @param config The configuration for the import process.
 * @param customContext Optional existing context for the import process.
 * @returns The SQL tables containing the imported GTFS data.
 */
export async function importGtfsToDatabase(config: ImportGtfsConfig): Promise<GtfsSQLTables> {
	try {
		//

		const globalTimer = new Timer();

		Logger.info({ message: 'Starting GTFS import process...' });

		//
		// Initialize context for the import process.
		// If an initial context is provided, use it, otherwise create a new one.

		const sqlTables = initGtfsSqlTables();
		const context = initImportGtfsContext(sqlTables, config);

		//
		// Download and extract the GTFS file.

		await extractGtfsSource(context);

		//
		// Process GTFS files in the correct order

		await processGtfsCalendar(context);
		await processGtfsCalendarDates(context);

		await processGtfsTrips(context);
		await processGtfsRoutes(context);
		await processGtfsShapes(context);
		await processGtfsStops(context);
		await processGtfsStopTimes(context);

		Logger.success(`Finished importing GTFS to database in ${globalTimer.get()}.`);

		return context.gtfs;

		//
	} catch (error) {
		Logger.error({ error, message: 'Error importing GTFS to database.' });
		throw error;
	}
}
