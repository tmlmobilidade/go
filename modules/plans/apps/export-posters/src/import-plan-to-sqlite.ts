import { exportAgencyFile } from '@/exports/agency.js';
import { exportCalendarFiles } from '@/exports/calendars.js';
import { exportDayTypesFile } from '@/exports/day_types.js';
import { exportFeedInfoFile } from '@/exports/feed_info.js';
import { exportRoutesFile } from '@/exports/routes.js';
import { exportStopTimesFile } from '@/exports/stop-times.js';
import { exportStopsFile } from '@/exports/stops.js';
import { exportTripsFile } from '@/exports/trips.js';
import { type ExportToHitouchConfig } from '@/types.js';
import { buildDatesMap } from '@/utils/build-dates-map.js';
import { createHitouchZip } from '@/utils/create-hitouch-zip.js';
import { importGtfsToDatabase, ImportGtfsToDatabaseConfig, initImportGtfsContext } from '@tmlmobilidade/import-gtfs';
import { files, holidays, yearPeriods } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type Plan } from '@tmlmobilidade/types';
import fs from 'node:fs';

export async function importPlanToSqlite(planData: Plan): Promise<ExportToHitouchConfig> {
	//

	//
	// Import the Plan into a local SQLite database

	const operationFileUrl = await files.getFileUrl({ file_id: planData.operation_file_id });
	const feedStartDate = planData.gtfs_feed_info.feed_start_date;
	const feedEndDate = planData.gtfs_feed_info.feed_end_date;
	const agencyId = planData.gtfs_agency.agency_id;

	//
	// Check if the feed start and end dates are valid

	if (!feedStartDate || !feedEndDate) {
		throw new Error(`Plan ${planData._id} is missing feed start or end dates.`);
	}

	const importConfig: ImportGtfsToDatabaseConfig = {
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

	const importContext = initImportGtfsContext();
	const sqlGtfs = await importGtfsToDatabase(importConfig, importContext);
	const sourceHasCalendar = fs.existsSync(`${importContext.workdir.extract_dir_path}/calendar.txt`);
	const [agencyHolidays, agencyYearPeriods] = await Promise.all([
		holidays.findByAgencyIds([agencyId]),
		yearPeriods.findMany({ agency_ids: { $in: [agencyId] } }),
	]);

	//
	// Setup the export config

	const exportConfig: ExportToHitouchConfig = {
		date_range: {
			end: feedEndDate,
			start: feedStartDate,
		},
		output: `../${planData._id}-hitouch-posters.zip`,
		source_has_calendar: sourceHasCalendar,
		workdir: `/tmp/hitouch/${planData._id}`,
	};

	if (fs.existsSync(exportConfig.workdir)) {
		fs.rmSync(exportConfig.workdir, { recursive: true });
	}
	fs.mkdirSync(exportConfig.workdir, { recursive: true });

	//
	// Export the files required by ZPHERES

	Logger.info({ message: `Exporting Plan ${planData._id} to HiTouch GTFS...` });

	const exportTimer = new Timer();

	const datesMap = buildDatesMap(exportConfig.date_range, agencyHolidays, agencyYearPeriods);

	await exportCalendarFiles(sqlGtfs, exportConfig, datesMap);
	await exportTripsFile(sqlGtfs, exportConfig);
	await exportStopTimesFile(sqlGtfs, exportConfig);
	await exportRoutesFile(sqlGtfs, exportConfig);
	await exportStopsFile(sqlGtfs, exportConfig);
	await exportAgencyFile(planData, exportConfig);
	await exportFeedInfoFile(planData, exportConfig);
	await exportDayTypesFile(exportConfig);

	Logger.info({ message: `Exported files in ${exportTimer.get()} seconds` });

	//
	// Package all exported TXT files into the HiTouch ZIP archive

	const zipTimer = new Timer();
	const outputPath = await createHitouchZip(exportConfig);
	const outputSize = fs.statSync(outputPath).size;

	Logger.info({ message: `Created ${outputPath} (${outputSize} bytes) in ${zipTimer.get()} seconds` });

	return exportConfig;
}
