/* * */

import { type ImportGtfsConfig } from '@/shared/config.js';
import { extractGtfsSource } from '@/shared/extract-source.js';
import { initImportGtfsContext } from '@/shared/init-context.js';
import { Logger } from '@tmlmobilidade/logger-logger-backend';
import { Timer } from '@tmlmobilidade/timer';

import { processGtfsStrictV29ExtCalendarDates } from './processors/calendar-dates.js';
import { processGtfsStrictV29ExtCalendar } from './processors/calendar.js';
import { processGtfsStrictV29ExtRoutes } from './processors/routes.js';
import { processGtfsStrictV29ExtShapes } from './processors/shapes.js';
import { processGtfsStrictV29ExtStopTimes } from './processors/stop-times.js';
import { processGtfsStrictV29ExtStops } from './processors/stops.js';
import { processGtfsStrictV29ExtTrips } from './processors/trips.js';
import { initGtfsStrictV29ExtSqlTables } from './tables.js';
import { type GtfsStrictV29ExtSQLTables } from './types.js';

/**
 * Imports GTFS Strict v29 Ext data into the database for a given plan.
 * @param config The configuration for the import process.
 * @param customContext Optional existing context for the import process.
 * @returns The SQL tables containing the imported GTFS data.
 */
export async function importGtfsStrictV29ExtToDatabase(config: ImportGtfsConfig): Promise<GtfsStrictV29ExtSQLTables> {
	try {
		//

		const globalTimer = new Timer();

		Logger.info({ message: 'Starting GTFS Strict v29 Ext import process...' });

		//
		// Initialize context for the import process.
		// If an initial context is provided, use it, otherwise create a new one.

		const sqlTables = initGtfsStrictV29ExtSqlTables();
		const context = initImportGtfsContext(sqlTables, config);

		//
		// Download and extract the GTFS file.

		await extractGtfsSource(context);

		//
		// Process GTFS files in the correct order

		await processGtfsStrictV29ExtCalendar(context);
		await processGtfsStrictV29ExtCalendarDates(context);
		await processGtfsStrictV29ExtTrips(context);
		await processGtfsStrictV29ExtRoutes(context);
		await processGtfsStrictV29ExtShapes(context);
		await processGtfsStrictV29ExtStops(context);
		await processGtfsStrictV29ExtStopTimes(context);

		Logger.success(`Finished importing GTFS Strict v29 Ext to database in ${globalTimer.get()}.`);

		return context.gtfs;

		//
	} catch (error) {
		Logger.error({ error, message: 'Error importing GTFS Strict v29 Ext to database.' });
		throw error;
	}
}
