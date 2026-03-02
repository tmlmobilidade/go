/* * */

import { type GtfsSQLTables, type ImportGtfsContext, type ImportGtfsToDatabaseConfig } from '@/types.js';
import { downloadAndExtractGtfs } from '@/utils/extract-file.js';
import { initGtfsSqlTables } from '@/utils/init-tables.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type Plan } from '@tmlmobilidade/types';

/* * */

import { processCalendarFile } from '@/processors/calendar.js';
import { processCalendarDatesFile } from '@/processors/calendar_dates.js';
import { processRoutesFile } from '@/processors/routes.js';
import { processShapesFile } from '@/processors/shapes.js';
import { processStopTimesFile } from '@/processors/stop_times.js';
import { processStopsFile } from '@/processors/stops.js';
import { processTripsFile } from '@/processors/trips.js';

/**
 * Imports GTFS data into the database for a given plan.
 * @param plan The plan containing GTFS feed information.
 * @param config Optional configuration for the import process.
 * @returns A promise that resolves to the imported GTFS SQL tables.
 */
export async function importGtfsToDatabase(plan: Plan, config: ImportGtfsToDatabaseConfig = {}): Promise<GtfsSQLTables> {
	try {
		//

		const globalTimer = new Timer();

		Logger.info(`Importing ${plan._id} GTFS to database...`);

		//
		// Initialize context for the current plan

		const context: ImportGtfsContext = {
			counters: {
				calendar_dates: 0,
				hashed_shapes: 0,
				hashed_trips: 0,
				shapes: 0,
				stop_times: 0,
				trips: 0,
			},
			gtfs: initGtfsSqlTables(),
			plan: plan,
			referenced_route_ids: new Set<string>(),
			referenced_shape_ids: new Set<string>(),
			workdir: await downloadAndExtractGtfs(plan),
		};

		//
		// Validate GTFS feed info

		if (!plan.gtfs_feed_info?.feed_start_date || !plan.gtfs_feed_info?.feed_end_date) {
			throw new Error(`Plan "${plan._id}" is missing GTFS feed start and/or end date.`);
		}

		//
		// Process GTFS files in the correct order

		await processCalendarFile(context, config);
		await processCalendarDatesFile(context, config);

		await processTripsFile(context);
		await processRoutesFile(context);
		await processShapesFile(context);
		await processStopsFile(context);
		await processStopTimesFile(context);

		Logger.success(`Finished importing GTFS to database for plan "${plan._id}" in ${globalTimer.get()}.`, 0);
		Logger.divider();

		Logger.terminate(`Finished importing GTFS to database in ${globalTimer.get()}.`);

		return context.gtfs;

		//
	} catch (error) {
		Logger.error('Error parsing plan.', error);
		throw error;
	}
}
