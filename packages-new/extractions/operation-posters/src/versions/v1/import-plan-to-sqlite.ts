/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { validateOperationalDate } from '@tmlmobilidade/go-types-shared';
import { type ImportGtfsConfig, importGtfsStrictV30ToDatabase } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import fs from 'node:fs';

import { exportAgencyFile } from './exports/agency.js';
import { exportCalendarFiles } from './exports/calendars.js';
import { exportDayTypesFile } from './exports/day_types.js';
import { exportRoutesFile } from './exports/routes.js';
import { exportShapesFiles } from './exports/shapes.js';
import { exportStopTimesFile } from './exports/stop-times.js';
import { exportStopsFile } from './exports/stops.js';
import { exportTripsFile } from './exports/trips.js';
import { type ExportHitouchConfig, type ExportHitouchOptions } from './types/export-hitouch-config.js';
import { buildDatesMap } from './utils/build-dates-map.js';
import { createHitouchZip } from './utils/create-hitouch-zip.js';
import { initOperationPostersV1Context } from './utils/init-context.js';

/* * */

export async function importPlanToSqlite(planData: Plan, options?: ExportHitouchOptions & { workdir?: string }): Promise<ExportHitouchConfig> {
	//

	//
	// Import the Plan into a local SQLite database

	const operationFileUrl = await storageProvider.getSignedUrl({ fileId: planData.attachments.operation_gtfs_normalized });
	const agencyId = planData.agency_id;

	//
	// Check the plan's active date range

	if (!planData.active_from || !planData.active_until || planData.active_from > planData.active_until) {
		throw new Error(`Plan ${planData._id} has missing or invalid active_from / active_until dates.`);
	}

	//
	// Import the GTFS feed into a local SQLite database

	const importConfig: ImportGtfsConfig = {
		source: {
			url: operationFileUrl,
		},
		time_range: {
			date_range: {
				end: planData.active_until,
				start: planData.active_from,
			},
		},
	};

	//
	// Import the GTFS feed into a local SQLite database

	const sqlGtfs = await importGtfsStrictV30ToDatabase(importConfig);

	const sourceHasCalendar = true;
	const [agencyHolidays, agencyYearPeriods] = await Promise.all([
		goDb.offer.holidays.findMany({ agency_ids: { $in: [agencyId] } }),
		goDb.offer.yearPeriods.findMany({ agency_ids: { $in: [agencyId] } }),
	]);

	//
	// Setup the export config

	const exportConfig: ExportHitouchConfig = {
		canvas_profile: options?.canvas_profile ?? '0Master.C',
		content_mode: options?.content_mode ?? 'all',
		date_range: {
			end: validateOperationalDate(String(planData.active_until)),
			start: validateOperationalDate(String(planData.active_from)),
		},
		line_codes: options?.line_codes ?? [],
		lines_mode: (options?.content_mode === 'lines' || options?.content_mode === 'lines_stops') ? options.lines_mode ?? 'include' : undefined,
		output: options?.workdir ? `${planData._id}-hitouch-posters.zip` : `../${planData._id}-hitouch-posters.zip`,
		source_has_calendar: sourceHasCalendar,
		stop_ids: options?.stop_ids ?? [],
		stops_mode: (options?.content_mode === 'stops' || options?.content_mode === 'lines_stops') ? options.stops_mode ?? 'include' : undefined,
		workdir: options?.workdir ?? `/tmp/hitouch/${planData._id}`,
	};

	if (fs.existsSync(exportConfig.workdir)) {
		fs.rmSync(exportConfig.workdir, { recursive: true });
	}
	const context = initOperationPostersV1Context(planData._id, exportConfig.workdir);

	//
	// Export the files required by the API

	Logger.info({ message: `Exporting Plan ${planData._id} to HiTouch GTFS...` });

	const exportTimer = new Timer();

	const datesMap = buildDatesMap(exportConfig.date_range, agencyHolidays, agencyYearPeriods);

	await exportCalendarFiles(context, sqlGtfs, exportConfig, datesMap);
	const routeIds = await exportRoutesFile(context, sqlGtfs, exportConfig);
	await exportTripsFile(context, sqlGtfs, routeIds);
	await exportStopTimesFile(context, sqlGtfs);
	await exportShapesFiles(context, sqlGtfs);
	await exportStopsFile(context, sqlGtfs, exportConfig, routeIds);
	await exportAgencyFile(context, planData);
	// feed_info.txt is intentionally excluded because HiTouch does not support it.
	await exportDayTypesFile(context);

	Logger.info({ message: `Exported files in ${exportTimer.get()} seconds` });

	//
	// Package all exported TXT files into the ZIP archive

	Logger.info({ message: `Creating HiTouch ZIP for Plan ${planData._id}...` });
	const zipTimer = new Timer();
	const outputPath = await createHitouchZip(exportConfig);
	const outputSize = fs.statSync(outputPath).size;

	Logger.info({ message: `Created ${outputPath} (${outputSize} bytes) in ${zipTimer.get()}` });

	return exportConfig;
}
