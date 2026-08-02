/* * */

import { extractGtfsSource } from '@/old/utils/extract-source.js';
import { type ImportGtfsToDatabaseConfig } from '@/shared/config-types.js';
import { initImportGtfsContext } from '@/shared/init-context.js';
import { processCalendarFile } from '@/versions/standard/processors/calendar.js';
import { processCalendarDatesFile } from '@/versions/standard/processors/calendar_dates.js';
import { processRoutesFile } from '@/versions/standard/processors/routes.js';
import { processShapesFile } from '@/versions/standard/processors/shapes.js';
import { processStopTimesFile } from '@/versions/standard/processors/stop_times.js';
import { processGtfsStops } from '@/versions/standard/processors/stops.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { type GtfsSQLTables, initGtfsSqlTables } from './init-tables.js';
import { processGtfsTrips } from './processors/trips.js';

/**
 * Imports GTFS data into the database for a given plan.
 * @param config The configuration for the import process.
 * @param customContext Optional existing context for the import process.
 * @returns The SQL tables containing the imported GTFS data.
 */
export async function importGtfsToDatabase(config: ImportGtfsToDatabaseConfig): Promise<GtfsSQLTables> {
	try {
		//

		const globalTimer = new Timer();

		Logger.info({ message: 'Starting GTFS import process...' });

		//
		// Initialize context for the import process.
		// If an initial context is provided, use it, otherwise create a new one.

		const sqlTables = initGtfsSqlTables();
		const context = initImportGtfsContext(sqlTables);

		//
		// Download and extract the GTFS file.

		await extractGtfsSource(context, config);

		//
		// Process GTFS files in the correct order

		await processCalendarFile(context, config);
		await processCalendarDatesFile(context, config);

		await processGtfsTrips(context);
		await processRoutesFile(context);
		await processShapesFile(context);
		await processGtfsStops(context);
		await processStopTimesFile(context);

		Logger.success(`Finished importing GTFS to database in ${globalTimer.get()}.`);

		return context.gtfs;

		//
	} catch (error) {
		Logger.error({ error, message: 'Error importing GTFS to database.' });
		throw error;
	}
}
