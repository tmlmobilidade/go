import { exportAgencyFile } from '@/exports/agency.js';
import { exportCalendarFiles } from '@/exports/calendars.js';
import { exportDayTypesFile } from '@/exports/day_types.js';
import { exportRoutesFile } from '@/exports/routes.js';
import { exportStopTimesFile } from '@/exports/stop-times.js';
import { exportStopsFile } from '@/exports/stops.js';
import { exportTripsFile } from '@/exports/trips.js';
import { type ExportToHitouchConfig } from '@/types.js';
import { buildDatesMap } from '@/utils/build-dates-map.js';
import { createHitouchZip } from '@/utils/create-hitouch-zip.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type LinesMode } from '@tmlmobilidade/go-types-offer';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { validateOperationalDate } from '@tmlmobilidade/go-types-shared';
import { type ImportGtfsConfig, importGtfsStrictV29ExtToDatabase } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import fs from 'node:fs';

/* * */

export async function importPlanToSqlite(planData: Plan, options?: { canvas_profile?: ExportToHitouchConfig['canvas_profile'], line_codes?: string[], lines_mode?: LinesMode, workdir?: string }): Promise<ExportToHitouchConfig> {
	//

	//
	// Import the Plan into a local SQLite database

	const operationFileUrl = await storageProvider.getSignedUrl({ fileId: planData.operation_file_id });
	const feedStartDate = planData.gtfs_feed_info.feed_start_date;
	const feedEndDate = planData.gtfs_feed_info.feed_end_date;
	const agencyId = planData.gtfs_agency.agency_id;

	//
	// Check if the feed start and end dates are valid

	if (!feedStartDate || !feedEndDate) {
		throw new Error(`Plan ${planData._id} is missing feed start or end dates.`);
	}

	//
	// Import the GTFS feed into a local SQLite database

	const importConfig: ImportGtfsConfig = {
		source: {
			url: operationFileUrl,
		},
		time_range: {
			date_range: {
				end: feedEndDate,
				start: feedStartDate,
			},
		},
	};

	//
	// Import the GTFS feed into a local SQLite database

	const sqlGtfs = await importGtfsStrictV29ExtToDatabase(importConfig);

	if (options?.lines_mode !== 'all' && options?.line_codes?.length) {
		const placeholders = options.line_codes.map(() => '?').join(', ');
		const matchingRoutes = sqlGtfs.routes.all(`WHERE CAST(line_id AS TEXT) IN (${placeholders})`, options.line_codes);

		if (!matchingRoutes.length) {
			throw new Error(`None of the selected lines exist in Plan ${planData._id}.`);
		}
		const selectedLineCodes = new Set(matchingRoutes.map(route => String(route.line_id)));
		const missingLineCodes = options.line_codes.filter(lineCode => !selectedLineCodes.has(lineCode));
		if (missingLineCodes.length) {
			throw new Error(`Lines ${missingLineCodes.join(', ')} do not exist in Plan ${planData._id}.`);
		}

		const selectedRoutes = options.lines_mode === 'exclude'
			? sqlGtfs.routes.all(`WHERE CAST(line_id AS TEXT) NOT IN (${placeholders})`, options.line_codes)
			: matchingRoutes;
		if (!selectedRoutes.length) {
			throw new Error(`The selected line filter removes every route from Plan ${planData._id}.`);
		}

		const selectedRouteIds = selectedRoutes.map(route => route.route_id);
		const routePlaceholders = selectedRouteIds.map(() => '?').join(', ');
		const filterTransaction = sqlGtfs._db.databaseInstance.transaction(() => {
			sqlGtfs.stop_times.run(`DELETE FROM stop_times WHERE trip_id NOT IN (SELECT trip_id FROM trips WHERE route_id IN (${routePlaceholders}))`, selectedRouteIds);
			sqlGtfs.trips.run(`DELETE FROM trips WHERE route_id NOT IN (${routePlaceholders})`, selectedRouteIds);
			sqlGtfs.routes.run(`DELETE FROM routes WHERE route_id NOT IN (${routePlaceholders})`, selectedRouteIds);
		});
		filterTransaction();
	}

	const sourceHasCalendar = true;
	const [agencyHolidays, agencyYearPeriods] = await Promise.all([
		goDb.offer.holidays.findMany({ agency_ids: { $in: [agencyId] } }),
		goDb.offer.yearPeriods.findMany({ agency_ids: { $in: [agencyId] } }),
	]);

	//
	// Setup the export config

	const exportConfig: ExportToHitouchConfig = {
		canvas_profile: options?.canvas_profile ?? '0Master.C',
		date_range: {
			end: validateOperationalDate(feedEndDate),
			start: validateOperationalDate(feedStartDate),
		},
		output: options?.workdir ? `${planData._id}-hitouch-posters.zip` : `../${planData._id}-hitouch-posters.zip`,
		source_has_calendar: sourceHasCalendar,
		workdir: options?.workdir ?? `/tmp/hitouch/${planData._id}`,
	};

	if (fs.existsSync(exportConfig.workdir)) {
		fs.rmSync(exportConfig.workdir, { recursive: true });
	}
	fs.mkdirSync(exportConfig.workdir, { recursive: true });

	//
	// Export the files required by the API

	Logger.info({ message: `Exporting Plan ${planData._id} to HiTouch GTFS...` });

	const exportTimer = new Timer();

	const datesMap = buildDatesMap(exportConfig.date_range, agencyHolidays, agencyYearPeriods);

	await exportCalendarFiles(sqlGtfs, exportConfig, datesMap);
	await exportTripsFile(sqlGtfs, exportConfig);
	await exportStopTimesFile(sqlGtfs, exportConfig);
	await exportRoutesFile(sqlGtfs, exportConfig);
	await exportStopsFile(sqlGtfs, exportConfig);
	await exportAgencyFile(planData, exportConfig);
	// await exportFeedInfoFile(exportConfig); // feed_info.txt is intentionally excluded because ZPHERES Studio does not support it.
	await exportDayTypesFile(exportConfig);

	Logger.info({ message: `Exported files in ${exportTimer.get()} seconds` });

	//
	// Package all exported TXT files into the ZIP archive

	const zipTimer = new Timer();
	const outputPath = await createHitouchZip(exportConfig);
	const outputSize = fs.statSync(outputPath).size;

	Logger.info({ message: `Created ${outputPath} (${outputSize} bytes) in ${zipTimer.get()} seconds` });

	return exportConfig;
}
