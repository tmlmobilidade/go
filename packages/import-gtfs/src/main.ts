/* * */

import { processCalendarFile } from '@/processors/calendar.js';
import { processCalendarDatesFile } from '@/processors/calendar_dates.js';
import { processRoutesFile } from '@/processors/routes.js';
import { processShapesFile } from '@/processors/shapes.js';
import { processStopTimesFile } from '@/processors/stop_times.js';
import { processStopsFile } from '@/processors/stops.js';
import { processTripsFile } from '@/processors/trips.js';
import { type ImportGtfsToDatabaseConfig } from '@/types/config.js';
import { type ImportGtfsContext } from '@/types/context.js';
import { type GtfsSQLTables } from '@/types/sql-tables.js';
import { extractGtfsSource } from '@/utils/extract-source.js';
import { initImportGtfsContext } from '@/utils/init-context.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/**
 * Imports GTFS data into the database for a given plan.
 * @param config The configuration for the import process.
 * @param customContext Optional existing context for the import process.
 * @returns The SQL tables containing the imported GTFS data.
 */
export async function importGtfsToDatabase(config: ImportGtfsToDatabaseConfig, customContext?: ImportGtfsContext): Promise<GtfsSQLTables> {
	try {
		//

		const globalTimer = new Timer();

		Logger.info(`Starting GTFS import process...`);

		//
		// Initialize context for the import process.
		// If an initial context is provided, use it, otherwise create a new one.

		const context = customContext ? customContext : initImportGtfsContext();

		//
		// Download and extract the GTFS file.

		await extractGtfsSource(context, config);

		//
		// Process GTFS files in the correct order

		await processCalendarFile(context, config);
		await processCalendarDatesFile(context, config);

		await processTripsFile(context);
		await processRoutesFile(context);
		await processShapesFile(context);
		await processStopsFile(context);
		await processStopTimesFile(context);

		Logger.success(`Finished importing GTFS to database in ${globalTimer.get()}.`);

		return context.gtfs;

		//
	} catch (error) {
		Logger.error('Error importing GTFS to database.', error);
		throw error;
	}
}
