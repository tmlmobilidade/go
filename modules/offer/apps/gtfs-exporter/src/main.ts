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
		Logger.info(`* Agency IDs: ${exportConfig.agency_ids.join(', ')}`);
		Logger.info(`* Version: ${exportConfig.version}`);
		Logger.info('* * *');

		// Clear existing CSV files to ensure fresh export
		await clearExportFiles(exportConfig);

		//
		// In order to build stops.txt, shapes.txt and calendar_dates.txt it is necessary
		// to initiate these variables outside all loops that hold the _ids
		// of the objects that are referenced in the other objects (trips, patterns)

		const referencedStopCodes = new Set<number>();
		const referencedFareIds = new Set<string>();

		// Initialize service registry for calendar deduplication
		const serviceRegistry = new ServiceRegistry();

		// Track circulations: (patternCode:timepoint) -> [{ ruleToken, serviceId }]
		const circulationTracker = new Map<string, { ruleToken: string, serviceId: string }[]>();

		// Define export date range
		const exportStartDate = Dates.fromOperationalDate(exportConfig.calendars_clip_start_date, 'Europe/Lisbon');
		const exportEndDate = Dates.fromOperationalDate(exportConfig.calendars_clip_end_date, 'Europe/Lisbon');

		//
		// 1.
		// Export Agency and Feed Info
		// These are single-record files that describe the dataset

		await updateProgress(progress, { progress_current: 1, progress_total: 7 });

		const allAgenciesData = await Promise.all(
			exportConfig.agency_ids.map(async (id) => {
				const agencyData = await agencies.findById(id);
				if (!agencyData) throw new Error(`Agency with ID ${id} not found`);
				return agencyData;
			}),
		);

		for (const agencyData of allAgenciesData) {
			await exportAgencyFile(agencyData, exportConfig);
		}
		Logger.success('Exported agency.txt');

		await exportFeedInfoFile(allAgenciesData[0], exportConfig);
		Logger.success('Exported feed_info.txt');

		const agenciesMap = new Map(allAgenciesData.map(a => [a._id, a]));

		//
		// 2.
		// Prepare to process lines
		// Retrieve only the lines that match the requested export options,
		// or all of them for the given agency if 'lines_include' and 'lines_exclude' are empty.

		await updateProgress(progress, { progress_current: 2, progress_total: 7 });

		// Build the base filter for the agency
		const linesFilter: { _id?: { $in?: string[], $nin?: string[] }, agency_id?: { $in: string[] } } = {
			agency_id: { $in: exportConfig.agency_ids },
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
		const allHolidaysMap = await fetchAllHolidays(exportConfig.agency_ids);
		Logger.success(`Loaded ${allHolidaysMap.size} holidays`);

		Logger.info('Fetching all events...');
		const allEventsMap = await fetchAllEvents(exportConfig.agency_ids);
		Logger.success(`Loaded ${allEventsMap.size} events`);

		// 3.
		// Process each line and its routes/patterns
		// Initiate the main loop that go through all lines
		// and progressively builds the GTFS files

		for (const [lineIndex, lineData] of allLinesData.entries()) {
			//
			const lineAgencyData = agenciesMap.get(lineData.agency_id) ?? allAgenciesData[0];

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
				await exportRoute(lineAgencyData, lineData, routeData, exportConfig, allTypologiesMap, routePatterns);

				// Export fares for this route
				await exportFareForRoute(lineAgencyData, lineData, routeData, exportConfig, allFaresMap, referencedFareIds);

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
					await exportZoning(lineAgencyData, lineData, patternData, allZonesMap, allFaresMap, typologyData || null, exportConfig);

					// Track referenced stops from the pattern path
					if (patternData.path) {
						for (const pathItem of patternData.path) {
							// Track referenced stop
							referencedStopCodes.add(pathItem.stop_id);
						}
					}

					// Export trips for this pattern (will deduplicate serviceIds across patterns)
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

					await exportStopTimesForPattern(patternData, tripSchedules, exportConfig, lineData.agency_id);

					// Track circulations for duplicate detection
					for (const schedule of tripSchedules) {
						const key = `${patternData.code}:${schedule.timepoint}`;
						if (!circulationTracker.has(key)) circulationTracker.set(key, []);
						const ruleToken = schedule.trip_id.split('|')[1] ?? '';
						circulationTracker.get(key).push({ ruleToken: ruleToken, serviceId: schedule.serviceId });
					}
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
		// Export all unique serviceIds and their dates that were collected during pattern processing

		await exportCalendarDates(serviceRegistry, allPeriodsMap, allHolidaysMap, exportConfig);

		//
		// Step 4.6: Write service-rule-map.json
		// Maps each unique serviceId to its date set and the rule tokens + patterns that produced it

		const serviceRuleMap = serviceRegistry.getServiceRuleMap();
		const serviceRuleMapJson: Record<string, { dates: string[], ruleTokens: { patterns: string[], ruleToken: string }[] }> = {};

		for (const [serviceId, info] of serviceRuleMap.entries()) {
			serviceRuleMapJson[serviceId] = {
				dates: Array.from(info.dates).sort(),
				ruleTokens: info.ruleTokens,
			};
		}

		fs.writeFileSync(
			`${exportConfig.workdir}/service-rule-map.json`,
			JSON.stringify(serviceRuleMapJson, null, 2),
			'utf-8',
		);

		Logger.success(`Exported service-rule-map.json with ${serviceRuleMap.size} unique service IDs`);

		//
		// Step 4.7: Write service-rule-duplicates.json
		// Identifies rule tokens that appear under multiple distinct serviceIds and shows the date differences

		// Build inverse map: ruleToken -> [{ serviceId, dates }]
		const ruleTokenIndex = new Map<string, { dates: Set<string>, serviceId: string }[]>();

		for (const [serviceId, info] of serviceRuleMap.entries()) {
			const sortedDates = new Set(Array.from(info.dates).sort());
			for (const entry of info.ruleTokens) {
				if (!ruleTokenIndex.has(entry.ruleToken)) {
					ruleTokenIndex.set(entry.ruleToken, []);
				}
				ruleTokenIndex.get(entry.ruleToken).push({ dates: sortedDates, serviceId });
			}
		}

		// Keep only tokens with more than one distinct serviceId
		const duplicatesJson: Record<string, { dates: string[], dates_exclusive: string[], serviceId: string }[]> = {};

		for (const [ruleToken, entries] of ruleTokenIndex.entries()) {
			if (entries.length < 2) continue;

			// All dates across all services for this token
			const allDates = new Set<string>();
			for (const entry of entries) {
				for (const d of entry.dates) allDates.add(d);
			}

			duplicatesJson[ruleToken] = entries.map(entry => ({
				dates: Array.from(entry.dates),
				dates_exclusive: Array.from(allDates).filter(d => !entry.dates.has(d)).sort(),
				serviceId: entry.serviceId,
			}));
		}

		fs.writeFileSync(
			`${exportConfig.workdir}/service-rule-duplicates.json`,
			JSON.stringify(duplicatesJson, null, 2),
			'utf-8',
		);

		Logger.success(`Exported service-rule-duplicates.json with ${Object.keys(duplicatesJson).length} duplicated rule tokens`);

		//
		// Step 4.8: Write circulation-duplicates.json
		// Identifies (pattern:timepoint) pairs that have multiple serviceIds sharing at least one date.

		const allServices = serviceRegistry.getAllServices();
		interface CirculationEntry { dates: string[], ruleToken: string, serviceId: string }
		const circulationDuplicatesJson: Record<string, { services: CirculationEntry[], shared_dates: string[] }> = {};

		for (const [key, entries] of circulationTracker.entries()) {
			if (entries.length < 2) continue;

			// Build date sets per entry
			const entriesWithDates = entries.map(e => ({
				...e,
				dates: Array.from(allServices.get(e.serviceId)?.dates ?? []).sort(),
			}));

			// Find dates shared by at least two serviceIds
			const dateCounts = new Map<string, number>();
			for (const entry of entriesWithDates) {
				for (const d of entry.dates) {
					dateCounts.set(d, (dateCounts.get(d) ?? 0) + 1);
				}
			}
			const sharedDates = Array.from(dateCounts.entries())
				.filter(([, count]) => count >= 2)
				.map(([d]) => d)
				.sort();

			if (sharedDates.length === 0) continue;

			circulationDuplicatesJson[key] = { services: entriesWithDates, shared_dates: sharedDates };
		}

		fs.writeFileSync(
			`${exportConfig.workdir}/circulation-duplicates.json`,
			JSON.stringify(circulationDuplicatesJson, null, 2),
			'utf-8',
		);

		Logger.success(`Exported circulation-duplicates.json with ${Object.keys(circulationDuplicatesJson).length} duplicate circulations`);

		//
		// Step 5: Export referenced fare attributes
		// Only export fare attributes for fares that are actually referenced

		await updateProgress(progress, { progress_current: 6, progress_total: 7 });

		Logger.info(`Exporting ${referencedFareIds.size} fare attributes...`);
		await exportFareAttributes(allAgenciesData[0], exportConfig, allFaresMap, referencedFareIds);
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
