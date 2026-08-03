/* * */

import { processCalendarFile } from '@/versions/standard/processors/calendar.js';
import { processCalendarDatesFile } from '@/versions/standard/processors/calendar-dates.js';
import { processRoutesFile } from '@/versions/standard/processors/routes.js';
import { processShapesFile } from '@/versions/standard/processors/shapes.js';
import { processStopTimesFile } from '@/versions/standard/processors/stop-times.js';
import { processStopsFile } from '@/versions/standard/processors/stops.js';
import { processTripsFile } from '@/versions/standard/processors/trips.js';
import { type ImportGtfsToDatabaseConfig } from '@/types/config.js';
import { type ImportGtfsContext } from '@/types/context.js';
import { type GtfsSQLTables } from '@/types/sql-tables.js';
import { extractGtfsSource } from '@/shared/extract-source.js';
import { initImportGtfsContext } from '@/old/utils/init-context.js';
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

		Logger.info({ message: 'Starting GTFS import process...' });

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
		Logger.error({ error, message: 'Error importing GTFS to database.' });
		throw error;
	}
}
