/* * */

import { exportAgencyFile } from '@/exports/agency.js';
import { exportCalendarFiles } from '@/exports/calendars.js';
import { exportDayTypesFile } from '@/exports/day_types.js';
import { exportFeedInfoFile } from '@/exports/feed_info.js';
import { exportRoutesFile } from '@/exports/routes.js';
import { exportStopTimesFile } from '@/exports/stop-times.js';
import { exportStopsFile } from '@/exports/stops.js';
import { exportTripsFile } from '@/exports/trips.js';
import { type ExportToHitouchConfig } from '@/types.js';
import { importGtfsToDatabase, type ImportGtfsToDatabaseConfig } from '@tmlmobilidade/import-gtfs';
import { files, plans } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger/sentry/node';
import { Timer } from '@tmlmobilidade/timer';
import fs from 'node:fs';

// import { getFormattedDates } from './get-names.js';

/* * */

await (async function main() {
	try {
		//

		//
		// Initialize Sentry

		try {
			await initSentryNode();
			Logger.info('');
			Logger.logsNode({ app: 'export-posters', message: 'Sentry Exporter Posters initialized', module: 'exporter', severity: 'info' });
		} catch {
			Logger.error('Error initializing Sentry Exporter Posters');
		}

		Logger.init();

		const globalTimer = new Timer();

		// console.log(getFormattedDates(['20250204', '20250205']));
		// console.log(getFormattedDates(['20250204', '20250205', '20250206', '20250207']));
		// console.log(getFormattedDates(['20250212', '20250214', '20250222']));
		// console.log(getFormattedDates(['20251201', '20251202', '20251207', '20251208', '20251214']));
		// console.log(getFormattedDates(['20250204', '20250205', '20250206', '20250207', '20250212', '20250214', '20250222']));

		// process.exit(0);

		//
		// Get single plan to process

		// const planData = await plans.findById('P1LDS'); // Teste Simples
		// const planData = await plans.findById('FPTD0'); // 41 Viação Alvorada
		// const planData = await plans.findById('LA4CI'); // 42 Rodoviária de Lisboa
		const planData = await plans.findById('BYBGK'); // 43 Transportes Sul do Tejo
		// const planData = await plans.findById('N8TKT'); // 44 Alsa Todi

		Logger.info(`Found Plan to process: ${planData._id}`);

		if (!planData) {
			Logger.info('Plan not found. Exiting...');
			return;
		}

		//
		// Import the Plan into a local SQLite database

		const operationFileUrl = await files.getFileUrl({ file_id: planData.operation_file_id });

		const importConfig: ImportGtfsToDatabaseConfig = {
			source: {
				url: operationFileUrl,
			},
		};

		const sqlGtfs = await importGtfsToDatabase(importConfig);

		//
		// Setup the export config

		const existingPlanDates = Array.from(new Set(Object.values(sqlGtfs.calendar_dates).flat())).sort();

		const exportConfig: ExportToHitouchConfig = {
			date_range: {
				end: existingPlanDates[existingPlanDates.length - 1],
				start: existingPlanDates[0],
			},
			output: 'export-hitouch.zip',
			workdir: '/tmp/hitouch',
		};

		if (fs.existsSync(exportConfig.workdir)) {
			fs.rmSync(exportConfig.workdir, { recursive: true });
		}
		fs.mkdirSync(exportConfig.workdir, { recursive: true });

		//
		// Start the export process

		Logger.info(`Exporting to HiTouch GTFS...`);

		const exportTimer = new Timer();

		await exportCalendarFiles(sqlGtfs, exportConfig);
		await exportTripsFile(sqlGtfs, exportConfig);
		await exportStopTimesFile(sqlGtfs, exportConfig);
		await exportRoutesFile(sqlGtfs, exportConfig);
		await exportStopsFile(sqlGtfs, exportConfig);
		await exportAgencyFile(planData, exportConfig);
		await exportFeedInfoFile(planData, exportConfig);
		await exportDayTypesFile(exportConfig);

		Logger.info(`Exported files in ${exportTimer.get()} seconds`);

		//

		Logger.terminate(`Run took ${globalTimer.get()}`);

		//
	} catch (error) {
		Logger.error(error);
		throw error;
	}
})();
