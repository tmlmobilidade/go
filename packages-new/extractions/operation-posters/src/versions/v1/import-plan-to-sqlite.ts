/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { validateOperationalDate } from '@tmlmobilidade/go-types-shared';
import { importGtfsStrictV30ToDatabase } from '@tmlmobilidade/import-gtfs';
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
import { type OperationPostersV1Tables } from './types/context.js';
import { type ExportHitouchConfig, type ExportHitouchOptions } from './types/export-hitouch-config.js';
import { type GtfsCalendar } from './types/gtfs-date.js';
import { buildDatesMap } from './utils/build-dates-map.js';
import { createHitouchZip } from './utils/create-hitouch-zip.js';
import { initOperationPostersV1Context } from './utils/init-context.js';
import { mergeGtfsTables } from './utils/merge-gtfs-tables.js';

/* * */

export async function importPlansToSqlite(plans: Plan[], options?: ExportHitouchOptions & { workdir?: string }): Promise<ExportHitouchConfig> {
	//
	// A. Validate every plan before importing any GTFS

	if (!plans.length) throw new Error('At least one plan is required for poster export.');
	for (const plan of plans) {
		if (!plan.active_from || !plan.active_until || plan.active_from > plan.active_until) {
			throw new Error(`Plan ${plan._id} has missing or invalid active_from / active_until dates.`);
		}
		if (!plan.attachments.operation_gtfs_normalized) {
			throw new Error(`Plan ${plan._id} has no normalized operation GTFS attachment for poster export.`);
		}
	}

	//
	// B. Setup one output directory for the combined export

	const runId = plans.map(plan => plan._id).join('-');
	const exportConfig: ExportHitouchConfig = {
		canvas_profile: options?.canvas_profile ?? '0Master.C',
		content_mode: options?.content_mode ?? 'all',
		date_range: {
			end: validateOperationalDate(String(Math.max(...plans.map(plan => plan.active_until)))),
			start: validateOperationalDate(String(Math.min(...plans.map(plan => plan.active_from)))),
		},
		line_codes: options?.line_codes ?? [],
		lines_mode: (options?.content_mode === 'lines' || options?.content_mode === 'lines_stops') ? options.lines_mode ?? 'include' : undefined,
		output: 'hitouch-posters.zip',
		source_has_calendar: true,
		stop_ids: options?.stop_ids ?? [],
		stops_mode: (options?.content_mode === 'stops' || options?.content_mode === 'lines_stops') ? options.stops_mode ?? 'include' : undefined,
		workdir: options?.workdir ?? `/tmp/hitouch/${runId}`,
	};

	if (fs.existsSync(exportConfig.workdir)) {
		fs.rmSync(exportConfig.workdir, { recursive: true });
	}
	const context = initOperationPostersV1Context(runId, exportConfig.workdir);
	const calendarsByService = new Map<string, GtfsCalendar>();
	let sqlGtfs: OperationPostersV1Tables | undefined;

	try {
		//
		// C. Import every selected GTFS before exporting any content

		for (const plan of plans) {
			const operationFileUrl = await storageProvider.getSignedUrl({ fileId: plan.attachments.operation_gtfs_normalized });
			const importedGtfs = await importGtfsStrictV30ToDatabase({
				source: { url: operationFileUrl },
				time_range: { date_range: { end: plan.active_until, start: plan.active_from } },
			});
			try {
				const [agencyHolidays, agencyYearPeriods] = await Promise.all([
					goDb.offer.holidays.findMany({ agency_ids: { $in: [plan.agency_id] } }),
					goDb.offer.yearPeriods.findMany({ agency_ids: { $in: [plan.agency_id] } }),
				]);
				const calendar: GtfsCalendar = {
					dates: buildDatesMap({
						end: validateOperationalDate(String(plan.active_until)),
						start: validateOperationalDate(String(plan.active_from)),
					}, agencyHolidays, agencyYearPeriods),
					plan_id: plan._id,
				};

				sqlGtfs = mergeGtfsTables(sqlGtfs, importedGtfs, plan._id, plans.length > 1);
				for (const serviceId of Object.keys(importedGtfs.calendar_dates)) {
					calendarsByService.set(serviceId, calendar);
				}
				Logger.info({ message: `Imported plan ${plan._id} into the combined poster database.` });
			} finally {
				if (importedGtfs !== sqlGtfs) importedGtfs._db.cleanup();
			}
		}

		//
		// D. Export the combined database once

		Logger.info({ message: `Exporting ${plans.length} plans to one HiTouch GTFS...` });
		const exportTimer = new Timer();

		await exportCalendarFiles(context, sqlGtfs, exportConfig, calendarsByService);
		const routeIds = await exportRoutesFile(context, sqlGtfs, exportConfig);
		await exportTripsFile(context, sqlGtfs, routeIds);
		await exportStopTimesFile(context, sqlGtfs);
		await exportShapesFiles(context, sqlGtfs);
		await exportStopsFile(context, sqlGtfs, exportConfig, routeIds);
		for (const plan of plans) await exportAgencyFile(context, plan);
		await exportDayTypesFile(context);

		Logger.info({ message: `Exported files in ${exportTimer.get()} seconds` });

		//
		// E. Package all exported TXT files into one ZIP archive

		const outputPath = await createHitouchZip(exportConfig);
		Logger.info({ message: `Created combined HiTouch ZIP at ${outputPath} (${fs.statSync(outputPath).size} bytes).` });
		return exportConfig;
	} catch (error) {
		context.workdir.remove();
		throw error;
	} finally {
		sqlGtfs?._db.cleanup();
	}
}
