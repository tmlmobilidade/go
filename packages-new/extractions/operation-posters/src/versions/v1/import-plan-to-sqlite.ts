/* * */

import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { validateOperationalDate } from '@tmlmobilidade/go-types-shared';
import { importGtfsToDatabase } from '@tmlmobilidade/go-utils-import-gtfs';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import { Timer } from '@tmlmobilidade/timer';
import fs from 'node:fs';

import { createHitouchZip } from './create-hitouch-zip.js';
import { exportAgencyFile } from './exports/agency.js';
import { exportCalendarAssignmentsExtFile } from './exports/calendar_assignments_ext.js';
import { exportCalendarDatesFile } from './exports/calendar_dates.js';
import { exportCalendarFile } from './exports/calendars.js';
import { exportDayTypesFile } from './exports/day_types.js';
import { exportRoutesFile } from './exports/routes.js';
import { exportRoutesToCanvasExtFile } from './exports/routes_to_canvas_ext.js';
import { exportShapesFile } from './exports/shapes.js';
import { exportShapesExtFile } from './exports/shapes_ext.js';
import { exportStopTimesFile } from './exports/stop-times.js';
import { exportStopsFile } from './exports/stops.js';
import { exportStopsToCanvasExtFile } from './exports/stops_to_canvas_ext.js';
import { exportTripsFile } from './exports/trips.js';
import { type OperationPostersV1Tables } from './types/context.js';
import { type ExportHitouchConfig, type ExportHitouchOptions } from './types/export-hitouch-config.js';
import { buildShapeExtensions } from './utils/build-shape-extensions.js';
import { prepareCalendarServices } from './utils/calendar-services/prepare-calendar-services.js';
import { initOperationPostersV1Context } from './utils/init-context.js';
import { mergeGtfsTables } from './utils/merge-gtfs-tables.js';

/* * */

export async function importPlansToSqlite(plans: Plan[], options?: ExportHitouchOptions & { workdir?: string }): Promise<ExportHitouchConfig> {
	//

	//
	// A. Setup variables

	let sqlGtfs: OperationPostersV1Tables | undefined;

	//
	// B. Validate every plan before importing any GTFS

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
	// C. Setup one output directory for the combined export

	const runId = plans.map(plan => plan._id).join('-');

	const exportConfig: ExportHitouchConfig = {
		canvas_profile: options?.canvas_profile ?? 'auto',
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

	//
	// D. Setup the output directory and context

	if (fs.existsSync(exportConfig.workdir)) {
		fs.rmSync(exportConfig.workdir, { recursive: true });
	}

	//
	// E. Initialize the context and track each service's source plan

	const context = initOperationPostersV1Context(runId, exportConfig.workdir);
	const plansByService = new Map<string, Plan>();

	try {
		for (const plan of plans) {
			//

			//
			// 1. Import the plan's GTFS file to the combined database

			const operationFileUrl = await storageProvider.getSignedUrl({ fileId: plan.attachments.operation_gtfs_normalized ?? undefined });

			const importedGtfs = await importGtfsToDatabase<OperationPostersV1Tables>({
				source: { url: operationFileUrl },
				time_range: { date_range: { end: plan.active_until, start: plan.active_from } },
			});

			//
			// 2. Merge the GTFS tables with the combined database

			try {
				sqlGtfs = mergeGtfsTables(sqlGtfs, importedGtfs);

				//
				// Preserve service ownership before cleaning up the imported database.
				// Calendar export uses the source plan to classify operating dates later.
				for (const serviceId of Object.keys(importedGtfs.calendar_dates)) {
					plansByService.set(serviceId, plan);
				}

				Logger.info({ message: `Imported plan ${plan._id} into the combined poster database.` });
			} finally {
				//
				// 3. Cleanup the imported plan's GTFS database

				if (importedGtfs !== sqlGtfs) importedGtfs._db.cleanup();
			}
		}

		//
		// E. Export the combined database once

		if (!sqlGtfs) throw new Error('No GTFS database was initialized for poster export.');

		Logger.info({ message: `Exporting ${plans.length} plans to one HiTouch GTFS...` });
		const exportTimer = new Timer();

		// Rebuild services once: every exporter must use the final trip and stop-time IDs.
		const services = await prepareCalendarServices(sqlGtfs, plansByService);
		const shapeExtensions = buildShapeExtensions(sqlGtfs.trips.all());

		const routeIds = await exportRoutesFile(context, sqlGtfs);

		// Each exporter owns one output file; finish all writes before database cleanup.
		const results = await Promise.allSettled([
			exportCalendarFile(context, services, exportConfig),
			exportCalendarDatesFile(context, services),
			exportCalendarAssignmentsExtFile(context, services),
			exportRoutesToCanvasExtFile(context, sqlGtfs, exportConfig, routeIds),
			exportTripsFile(context, sqlGtfs, routeIds, exportConfig),
			exportStopTimesFile(context, sqlGtfs, exportConfig),
			exportShapesFile(context, sqlGtfs, shapeExtensions),
			exportShapesExtFile(context, sqlGtfs, shapeExtensions),
			exportStopsFile(context, sqlGtfs),
			exportStopsToCanvasExtFile(context, sqlGtfs, exportConfig, routeIds),
			(async () => {
				// Keep writes to the shared agency file in plan order.
				for (const plan of plans) await exportAgencyFile(context, plan);
			})(),
			exportDayTypesFile(context),
		]);

		const failedExport = results.find(result => result.status === 'rejected');
		if (failedExport) throw failedExport.reason;

		Logger.info({ message: `Exported files in ${exportTimer.get()} seconds` });

		//
		// E. Package all exported TXT files into one ZIP archive

		const outputPath = await createHitouchZip(exportConfig);

		Logger.info({ message: `Created combined HiTouch ZIP at ${outputPath} (${fs.statSync(outputPath).size} bytes).` });

		return exportConfig;
	} catch (error) {
		//
		// 5. Cleanup the context and workdir

		context.workdir.remove();
		throw error;
	} finally {
		//
		// 6. Cleanup the SQL database

		sqlGtfs?._db.cleanup();
	}
}
