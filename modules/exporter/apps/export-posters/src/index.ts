/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { validateOperationalDate } from '@tmlmobilidade/go-types-shared';
import { type ImportGtfsConfig, importGtfsStrictV29ExtToDatabase } from '@tmlmobilidade/import-gtfs';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import fs from 'node:fs';

import { exportAgencyFile } from './tasks/export-agency.js';
import { exportCalendarFiles } from './tasks/export-calendars.js';
import { exportDayTypesFile } from './tasks/export-day-types.js';
import { exportFeedInfoFile } from './tasks/export-feed-info.js';
import { exportRoutesFile } from './tasks/export-routes.js';
import { exportStopTimesFile } from './tasks/export-stop-times.js';
import { exportStopsFile } from './tasks/export-stops.js';
import { exportTripsFile } from './tasks/export-trips.js';
import { type ExportToHitouchConfig } from './types.js';

/* * */

//
// Initialize Sentry

try {
	await initSentryNode();
	Logger.startNodeLogs({ app: 'export-posters', message: 'Sentry Exporter Posters initialized', module: 'exporter', severity: 'info' });
} catch (error) {
	Logger.error({ error, message: 'Error initializing Sentry Exporter Posters' });
}

async function main() {
	//

	try {
		//

		Logger.init();

		const globalTimer = new Timer();

		//
		// Get the single plan to process

		// const planData = await goDb.operation.plans.findById('P1LDS'); // Teste Simples
		// const planData = await goDb.operation.plans.findById('FPTD0'); // 41 Viação Alvorada
		// const planData = await goDb.operation.plans.findById('LA4CI'); // 42 Rodoviária de Lisboa
		const planData = await goDb.operation.plans.findById('BYBGK'); // 43 Transportes Sul do Tejo
		// const planData = await goDb.operation.plans.findById('N8TKT'); // 44 Alsa Todi

		if (!planData) {
			Logger.info({ message: 'Plan not found. Exiting...' });
			return;
		}

		Logger.info({ message: `Found Plan to process: ${planData._id}` });

		//
		// Import the Plan into a local SQLite database

		const operationFileUrl = await storageProvider.getSignedUrl({ fileId: planData.attachments.operation_gtfs });

		const importConfig: ImportGtfsConfig = {
			source: {
				url: operationFileUrl,
			},
		};

		const sqlGtfs = await importGtfsStrictV29ExtToDatabase(importConfig);

		//
		// Setup the export config

		const existingPlanDates = Array.from(new Set(Object.values(sqlGtfs.calendar_dates).flat()))
			.map(date => validateOperationalDate(String(date)))
			.sort();

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

		Logger.info({ message: `Exporting to HiTouch GTFS...` });

		const exportTimer = new Timer();

		await exportCalendarFiles(sqlGtfs, exportConfig);
		await exportTripsFile(sqlGtfs, exportConfig);
		await exportStopTimesFile(sqlGtfs, exportConfig);
		await exportRoutesFile(sqlGtfs, exportConfig);
		await exportStopsFile(sqlGtfs, exportConfig);
		await exportAgencyFile(planData, exportConfig);
		await exportFeedInfoFile(planData, exportConfig);
		await exportDayTypesFile(exportConfig);

		Logger.info({ message: `Exported files in ${exportTimer.get()} seconds` });

		//

		Logger.terminate(`Run took ${globalTimer.get()}`);

		//
	} catch (error) {
		Logger.error(error);
		throw error;
	}
}

/* * */

await main();
