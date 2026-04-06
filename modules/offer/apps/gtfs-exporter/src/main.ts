/* * */

import { exportAgencyFile, exportCalendarDates, exportFareAttributes, exportFareForRoute, exportRoute, exportShape, exportStop, exportStopTimesForPattern, exportTripsForPattern, exportZoning } from '@/exports/index.js';
import { type ExportProgress, type GtfsV29ExportConfig } from '@/types.js';
import { ServiceRegistry } from '@/utils/service-registry.js';
import { Dates } from '@tmlmobilidade/dates';
import { agencies, lines, patterns, routes, stops } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import fs from 'node:fs';

import { exportFeedInfoFile } from './exports/feedInfo.js';
import { fetchAllEvents } from './fetchers/events.js';
import { fetchAllFares } from './fetchers/fare.js';
import { fetchAllHolidays } from './fetchers/holidays.js';
import { fetchAllMunicipalities } from './fetchers/municipality.js';
import { fetchAllTypologies } from './fetchers/typology.js';
import { fetchAllYearPeriods } from './fetchers/year-periods.js';
import { fetchAllZones } from './fetchers/zone.js';

/* * */

/**
 * Clears all CSV files in the export directory to ensure fresh export
 * @param exportConfig - The export configuration with workdir path
 */
async function clearExportFiles(exportConfig: GtfsV29ExportConfig) {
	try {
		if (fs.existsSync(exportConfig.workdir)) {
			const files = fs.readdirSync(exportConfig.workdir);
			for (const file of files) {
				if (file.endsWith('.txt')) {
					fs.unlinkSync(`${exportConfig.workdir}/${file}`);
				}
			}
			Logger.info('Cleared existing CSV files');
		}
	} catch (error) {
		Logger.error('Error clearing export files', error);
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
		Logger.info(`Progress: ${updates.progress_current || 0}/${updates.progress_total || 0}`);
	} catch (error) {
		Logger.error(`Error updating progress for export ${exportDocument._id}`, error);
		throw new Error(`Error updating progress: ${error}`);
	}
}

/**
 * Main export function for GTFS v29
 * @param progress - The export progress tracking document
 * @param exportConfig - The export configuration options
 */
export async function exportGtfsV29(
	progress: ExportProgress,
	exportConfig: GtfsV29ExportConfig,
) {
	try {
		Logger.info('* * *');
		Logger.info('* GTFS v29 : NEW EXPORT');
		Logger.info(`* Agency ID: ${exportConfig.agency_id}`);
		Logger.info(`* Version: ${exportConfig.version}`);
		Logger.info('* * *');

		// Clear existing CSV files to ensure fresh export
		await clearExportFiles(exportConfig);

		//
		// In order to build stops.txt, shapes.txt and calendar_dates.txt it is necessary
		// to initiate these variables outside all loops that hold the _ids
		// of the objects that are referenced in the other objects (trips, patterns)

		const referencedStopCodes = new Set<string>();
		const referencedFareIds = new Set<string>();

		// Initialize service registry for calendar deduplication
		const serviceRegistry = new ServiceRegistry();

		// Define export date range
		const exportStartDate = Dates.fromISO(exportConfig.feed_start_date);
		const exportEndDate = Dates.fromISO(exportConfig.feed_end_date);

		//
		// 1.
		// Export Agency and Feed Info
		// These are single-record files that describe the dataset

		await updateProgress(progress, { progress_current: 1, progress_total: 7 });

		const agencyData = await agencies.findById(exportConfig.agency_id);
		if (!agencyData) {
			throw new Error(`Agency with ID ${exportConfig.agency_id} not found`);
		}

		await exportAgencyFile(agencyData, exportConfig);
		Logger.success('Exported agency.txt');

		await exportFeedInfoFile(agencyData, exportConfig);
		Logger.success('Exported feed_info.txt');

		//
		// 2.
		// Prepare to process lines
		// Retrieve only the lines that match the requested export options,
		// or all of them for the given agency if 'lines_include' and 'lines_exclude' are empty.

		await updateProgress(progress, { progress_current: 2, progress_total: 7 });

		// Build the base filter for the agency
		const linesFilter: { _id?: { $in?: string[], $nin?: string[] }, agency_id: string } = {
			agency_id: exportConfig.agency_id,
		};

		// Apply include/exclude filters
		if (exportConfig.lines_include.length > 0) {
			// If lines_include is specified, only include those lines
			linesFilter._id = { $in: exportConfig.lines_include };
		} else if (exportConfig.lines_exclude.length > 0) {
			// If lines_exclude is specified, exclude those lines
			linesFilter._id = { $nin: exportConfig.lines_exclude };
		}

		const allLinesData = await lines.findMany(linesFilter, { sort: { code: 1 } });

		await updateProgress(progress, { progress_current: 0, progress_total: allLinesData.length });

		Logger.info(`Processing ${allLinesData.length} lines...`);

		//
		// Fetch all typologies and fares data

		Logger.info('Fetching all typologies...');
		const allTypologiesMap = await fetchAllTypologies();
		Logger.success(`Loaded ${allTypologiesMap.size} typologies`);

		Logger.info('Fetching all fares...');
		const allFaresMap = await fetchAllFares();
		Logger.success(`Loaded ${allFaresMap.size} fares`);

		Logger.info('Fetching all zones...');
		const allZonesMap = await fetchAllZones();
		Logger.success(`Loaded ${allZonesMap.size} zones`);

		Logger.info('Fetching all municipalities...');
		const allMunicipalitiesMap = await fetchAllMunicipalities();
		Logger.success(`Loaded ${allMunicipalitiesMap.size} municipalities`);

		Logger.info('Fetching all periods...');
		const allPeriodsMap = await fetchAllYearPeriods();
		Logger.success(`Loaded ${allPeriodsMap.size} periods`);

		Logger.info('Fetching all holidays...');
		const allHolidaysMap = await fetchAllHolidays(exportConfig.agency_id);
		Logger.success(`Loaded ${allHolidaysMap.size} holidays`);

		Logger.info('Fetching all events...');
		const allEventsMap = await fetchAllEvents(exportConfig.agency_id);
		Logger.success(`Loaded ${allEventsMap.size} events`);

		// 3.
		// Process each line and its routes/patterns
		// Initiate the main loop that go through all lines
		// and progressively builds the GTFS files

		for (const [lineIndex, lineData] of allLinesData.entries()) {
			//

			// 3.0.
			// Update progress
			await updateProgress(progress, { progress_current: lineIndex + 1 });
			Logger.info(`Processing line ${lineIndex + 1}/${allLinesData.length}: ${lineData.code} - ${lineData.name}`);

			// 3.1.
			// Fetch all routes for this line
			const lineRoutes = await routes.findByLineId(lineData._id);

			if (lineRoutes.length === 0) {
				Logger.info(`  Skipping line ${lineData.code}: no routes found`);
				// continue;
			}

			// 3.2.
			// Loop on all the routes for this line
			for (const routeData of lineRoutes) {
				const routeId = routeData.code;

				// Fetch all patterns for this route
				const routePatterns = await patterns.findMany({
					line_id: lineData._id,
					route_id: routeData._id,
				});

				if (routePatterns.length === 0) {
					Logger.info(`  Skipping route ${routeId}: no patterns found`);
					continue;
				}

				// Check if at least one pattern has a valid shape and path
				const hasValidPatterns = routePatterns.some(pattern => pattern.shape?.geojson?.geometry?.coordinates?.length > 0 && pattern.path?.length > 0);

				if (!hasValidPatterns) {
					Logger.info(`  Skipping route ${routeId}: no valid patterns with shape and path`);
					continue;
				}

				// Export the route
				await exportRoute(agencyData, lineData, routeData, exportConfig, allTypologiesMap, routePatterns);

				// Export fares for this route
				await exportFareForRoute(agencyData, lineData, routeData, exportConfig, allFaresMap, referencedFareIds);

				for (const patternData of routePatterns) {
					// Skip patterns without shape or path
					if (!patternData.shape?.geojson?.geometry?.coordinates?.length || !patternData.path?.length) {
						Logger.info(`    Skipping pattern ${patternData.code}: missing shape or path`);
						continue;
					}

					// Build shape ID
					const shapeId = `shp_${patternData.code}`;

					// Export shape
					await exportShape(shapeId, patternData.shape, exportConfig);

					// Export afetacao (zoning) for this pattern
					// Get typology data for this line
					const typologyData = lineData.typology ? allTypologiesMap.get(lineData.typology) : null;
					await exportZoning(agencyData, lineData, patternData, allZonesMap, allFaresMap, typologyData || null, exportConfig);

					// Track referenced stops from the pattern path
					if (patternData.path) {
						for (const pathItem of patternData.path) {
							// Track referenced stop
							referencedStopCodes.add(pathItem.stop_id);
						}
					}

					// Export trips for this pattern (will deduplicate service_ids across patterns)
					const tripSchedules = await exportTripsForPattern(
						routeData,
						patternData,
						shapeId,
						Array.from(allPeriodsMap.values()),
						Array.from(allHolidaysMap.values()),
						Array.from(allEventsMap.values()),
						exportStartDate,
						exportEndDate,
						serviceRegistry,
						exportConfig,
					);

					await exportStopTimesForPattern(patternData, tripSchedules, exportConfig);
				}

				Logger.info(`  Processed route ${routeId} with ${routePatterns.length} patterns`);
			}

			Logger.info(`Processed line ${lineIndex + 1}/${allLinesData.length}`);
		}

		//
		// Step 4: Export referenced stops
		// Only export stops that are actually referenced in the patterns

		await updateProgress(progress, { progress_current: 5, progress_total: 7 });

		Logger.info('Fetching stops...');
		const allStopsData = exportConfig.stops_export_all
			? await stops.findMany({}, { sort: { _id: 1 } })
			: await stops.findMany({ _id: { $in: Array.from(referencedStopCodes) } }, { sort: { _id: 1 } });

		Logger.info(`Processing ${allStopsData.length} stops...`);

		// Export each stop
		for (const stopData of allStopsData) {
			const municipalityData = stopData.municipality_id
				? allMunicipalitiesMap.get(stopData.municipality_id)
				: undefined;

			await exportStop(stopData, municipalityData, exportConfig);
		}

		Logger.success(`Exported ${allStopsData.length} stops to stops.txt`);

		//
		// Step 4.5: Export calendar_dates
		// Export all unique service_ids and their dates that were collected during pattern processing

		await exportCalendarDates(serviceRegistry, allPeriodsMap, allHolidaysMap, exportConfig);

		//
		// Step 5: Export referenced fare attributes
		// Only export fare attributes for fares that are actually referenced

		await updateProgress(progress, { progress_current: 6, progress_total: 7 });

		Logger.info(`Exporting ${referencedFareIds.size} fare attributes...`);
		await exportFareAttributes(agencyData, exportConfig, allFaresMap, referencedFareIds);
		Logger.success('Exported fare_attributes.txt');

		//
		// Step 6: Flush all writers to ensure data is written to disk

		await exportConfig.writers.agency.flush();
		await exportConfig.writers.routes.flush();
		await exportConfig.writers.fare_rules.flush();
		await exportConfig.writers.fare_attributes.flush();
		await exportConfig.writers.shapes.flush();
		await exportConfig.writers.afetacao.flush();
		await exportConfig.writers.stops.flush();
		await exportConfig.writers.trips.flush();
		await exportConfig.writers.calendar_dates.flush();
		await exportConfig.writers.feed_info.flush();
		await exportConfig.writers.stop_times.flush();

		Logger.success('All files flushed successfully');

	//
	} catch (error) {
		Logger.error('Error during GTFS v29 export', error);
		throw error;
	}
}
