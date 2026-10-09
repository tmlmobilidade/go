/* * */

import { exportAgencyFile } from '@/exports/agency.js';
import { exportCalendar } from '@/exports/calendar.js';
import { exportCalendarDates } from '@/exports/calendar_dates.js';
import { exportShape } from '@/exports/shapes.js';
import { exportStop } from '@/exports/stops.js';
import { exportTripsForPattern } from '@/exports/trips.js';
import { type ExportProgress, type GtfsSteppV1ExportConfig } from '@/types.js';
import { ServiceRegistry } from '@/utils/service-registry.js';
import { Dates } from '@tmlmobilidade/dates';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import fs from 'node:fs';

/* * */

/**
 * Clears all CSV files in the export directory to ensure fresh export
 * @param exportConfig - The export configuration with workdir path
 */
async function clearExportFiles(exportConfig: GtfsSteppV1ExportConfig) {
	try {
		if (fs.existsSync(exportConfig.workdir)) {
			const files = fs.readdirSync(exportConfig.workdir);
			for (const file of files) {
				if (file.endsWith('.txt') || file.endsWith('.csv')) {
					fs.unlinkSync(`${exportConfig.workdir}/${file}`);
				}
			}
			Logger.info({ message: 'Cleared existing CSV files' });
		}
	} catch (error) {
		Logger.error({ error, message: 'Error clearing export files' });
		// Don't throw - continue with export even if cleanup fails
	}
}

/* * */

/**
 * Updates export progress in the database
 * @param exportDocument - The export document to update
 * @param updates - The updates to apply
 */
async function updateProgress(
	exportDocument: ExportProgress,
	updates: Partial<Pick<ExportProgress, 'progress_current' | 'progress_total'>>,
) {
	try {
		// TODO: Replace with actual database update logic
		// await ExportModel.updateOne({ _id: exportDocument._id }, updates);
		Logger.info({ message: `Progress: ${updates.progress_current || 0}/${updates.progress_total || 0}` });
	} catch (error) {
		Logger.error({ error, message: `Error updating progress for export ${exportDocument._id}` });
		throw new Error(`Error updating progress: ${error}`, { cause: error });
	}
}

/**
 * Main export function for GTFS STEPP v1.
 * Writes every GTFS file into `exportConfig.workdir`. The extractions worker
 * is responsible for zipping that directory and making it available for download.
 * @param progress - The export progress tracking document
 * @param exportConfig - The export configuration options
 */
export async function exportGtfsSteppV1(progress: ExportProgress, exportConfig: GtfsSteppV1ExportConfig) {
	try {
		//

		Logger.info({ message: '* * *' });
		Logger.info({ message: '* GTFS STEPP v1 : NEW EXPORT' });
		Logger.info({ message: `* Agency ID: ${exportConfig.agency_id}` });
		Logger.info({ message: `* Dates: ${exportConfig.start_date} to ${exportConfig.end_date}` });
		Logger.info({ message: '* * *' });

		// Clear existing CSV files to ensure fresh export
		await clearExportFiles(exportConfig);

		//
		// In order to build stops.txt, calendar.txt and calendar_dates.txt it is necessary
		// to initiate these variables outside all loops that hold the _ids
		// of the objects that are referenced in the other objects (trips, patterns)

		const referencedStopCodes = new Set<string>();

		// Initialize service registry for calendar deduplication
		const serviceRegistry = new ServiceRegistry();

		// Define export date range
		const exportStartDate = Dates.fromOperationalDate(exportConfig.start_date, 'Europe/Lisbon');
		const exportEndDate = Dates.fromOperationalDate(exportConfig.end_date, 'Europe/Lisbon');

		//
		// 1.
		// Export Agency

		await updateProgress(progress, { progress_current: 1, progress_total: 5 });

		const agencyData = await goDb.core.agencies.findById(exportConfig.agency_id);
		if (!agencyData) throw new Error(`Agency with ID ${exportConfig.agency_id} not found`);

		await exportAgencyFile(agencyData, exportConfig);
		Logger.success('Exported agency.txt');

		//
		// 2.
		// Prepare to process lines
		// Fetch data that will be needed for multiple lines/patterns to avoid redundant fetching inside the loops

		await updateProgress(progress, { progress_current: 2, progress_total: 5 });

		const allLinesData = await goDb.offer.lines.findMany({ agency_id: exportConfig.agency_id }, { sort: { code: 1 } });
		Logger.info({ message: `Processing ${allLinesData.length} lines...` });

		Logger.info({ message: 'Fetching stops...' });
		const allStopsData = await goDb.infrastructure.stops.findMany({}, { sort: { _id: 1 } });
		Logger.success(`Loaded ${allStopsData.length} stops`);

		Logger.info({ message: 'Fetching all periods...' });
		const allPeriodsData = await goDb.offer.yearPeriods.findMany({});
		Logger.success(`Loaded ${allPeriodsData.length} periods`);

		Logger.info({ message: 'Fetching all holidays...' });
		const allHolidaysData = await goDb.offer.holidays.findMany({ agency_ids: { $in: [exportConfig.agency_id] } });
		Logger.success(`Loaded ${allHolidaysData.length} holidays`);

		Logger.info({ message: 'Fetching all events...' });
		const allEventsData = await goDb.offer.events.findMany({ agency_ids: { $in: [exportConfig.agency_id] } });
		Logger.success(`Loaded ${allEventsData.length} events`);

		//
		// 3.
		// Process each line and its routes/patterns
		// Initiate the main loop that go through all lines
		// and progressively builds the GTFS files

		for (const [lineIndex, lineData] of allLinesData.entries()) {
			//

			await updateProgress(progress, { progress_current: lineIndex + 1, progress_total: allLinesData.length });
			Logger.info({ message: `Processing line ${lineIndex + 1}/${allLinesData.length}: ${lineData.code} - ${lineData.name}` });

			const lineRoutes = await goDb.offer.routes.findMany({ line_id: lineData._id });

			for (const routeData of lineRoutes) {
				//

				const routePatterns = await goDb.offer.patterns.findMany({
					line_id: lineData._id,
					route_id: routeData._id,
				});

				for (const patternData of routePatterns) {
					// Skip patterns without shape or path
					if (!patternData.shape?.geojson?.geometry?.coordinates?.length || !patternData.path?.length) {
						Logger.info({ message: `    Skipping pattern ${patternData.code}: missing shape or path` });
						continue;
					}

					// Export shape
					const shapeId = `shp_${patternData.code}`;
					await exportShape(shapeId, patternData.shape, exportConfig);

					// Track referenced stops from the pattern path
					for (const pathItem of patternData.path) {
						referencedStopCodes.add(String(pathItem.stop_id));
					}

					// Export trips for this pattern (will deduplicate serviceIds across patterns).
					// This is also what fills the service registry used by calendar.txt and calendar_dates.txt.
					await exportTripsForPattern(
						routeData,
						patternData,
						shapeId,
						allPeriodsData,
						allHolidaysData,
						allEventsData,
						exportStartDate,
						exportEndDate,
						serviceRegistry,
						exportConfig,
					);
				}

				Logger.info({ message: `  Processed route ${routeData.code} with ${routePatterns.length} patterns` });
			}
		}

		//
		// 4.
		// Export referenced stops
		// Only export stops that are actually referenced in the patterns

		await updateProgress(progress, { progress_current: 3, progress_total: 5 });

		let exportedStopsCount = 0;

		for (const stopData of allStopsData) {
			if (!referencedStopCodes.has(String(stopData._id))) continue;
			await exportStop(stopData, exportConfig);
			exportedStopsCount++;
		}

		Logger.success(`Exported ${exportedStopsCount} stops to stops.txt`);

		//
		// 5.
		// Export calendar and calendar_dates
		// Export all unique serviceIds and their dates that were collected during pattern processing

		await updateProgress(progress, { progress_current: 4, progress_total: 5 });

		await exportCalendar(serviceRegistry, exportConfig);
		await exportCalendarDates(serviceRegistry, exportConfig);

		//
		// 6.
		// Flush all writers to ensure data is written to disk

		await updateProgress(progress, { progress_current: 5, progress_total: 5 });

		await exportConfig.writers.agency.flush();
		await exportConfig.writers.calendar.flush();
		await exportConfig.writers.calendar_dates.flush();
		await exportConfig.writers.shapes.flush();
		await exportConfig.writers.stops.flush();
		await exportConfig.writers.trips.flush();

		Logger.success('All files flushed successfully');

	//
	} catch (error) {
		Logger.error({ error, message: 'Error during GTFS STEPP v1 export' });
		throw error;
	}
}
