/* * */

import { PostersController } from '@/controller/posters.controller.js';
import { exportAgencyFile } from '@/exports/agency.js';
import { exportCalendarFiles } from '@/exports/calendars.js';
import { exportDayTypesFile } from '@/exports/day_types.js';
import { exportFeedInfoFile } from '@/exports/feed_info.js';
import { exportRoutesFile } from '@/exports/routes.js';
import { exportStopTimesFile } from '@/exports/stop-times.js';
import { exportStopsFile } from '@/exports/stops.js';
import { exportTripsFile } from '@/exports/trips.js';
import { type ExportToHitouchConfig } from '@/types.js';
import { Dates } from '@tmlmobilidade/dates';
import { importGtfsToDatabase, type ImportGtfsToDatabaseConfig } from '@tmlmobilidade/import-gtfs';
import { files, plans } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
// import { initSentryNode } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';
import fs from 'node:fs';

// import { getFormattedDates } from './get-names.js';

/* * */

const postersController = new PostersController();

/* * */

async function main(): Promise<void> {
	try {
		//

		//
		// Initialize Sentry

		// try {
		// 	await initSentryNode();
		// 	Logger.startNodeLogs({ app: 'export-posters', message: 'Sentry Exporter Posters initialized', module: 'exporter', severity: 'info' });
		// } catch (error) {
		// 	Logger.error({ error, message: 'Error initializing Sentry Exporter Posters' });
		// }

		//
		// Initialize the logger

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
		// const planData = await plans.findById('BYBGK'); // 43 Transportes Sul do Tejo
		// const planData = await plans.findById('N8TKT'); // 44 Alsa Todi

		//
		// Get the first plan to process

		const planData = await plans.findOne(
			{ 'apps.posters.status': 'waiting' },
			{ sort: { 'apps.posters.timestamp': 1 } },
		);

		//
		// If no plan is found, exit

		if (!planData) {
			Logger.info({ message: 'Plan not found. Exiting...' });

			Logger.terminate(`Run took ${globalTimer.get()}`);
			return;
		}

		//
		// Request a token from the ZPHERES API

		await postersController.generateToken();

		//
		// Update the plan status to 'processing'

		await plans.updateById(planData._id, {
			apps: {
				...planData.apps,
				posters: {
					...planData.apps.posters,
					status: 'processing',
					timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
				},
			},
		});

		Logger.info({ message: `Found Plan to process: ${planData._id}` });

		//
		// Import the Plan into a local SQLite database

		const operationFileUrl = await files.getFileUrl({ file_id: planData.operation_file_id });
		const feedStartDate = planData.gtfs_feed_info.feed_start_date;
		const feedEndDate = planData.gtfs_feed_info.feed_end_date;

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

		const sqlGtfs = await importGtfsToDatabase(importConfig);

		//
		// Setup the export config

		const exportConfig: ExportToHitouchConfig = {
			date_range: {
				end: feedEndDate,
				start: feedStartDate,
			},
			output: 'export-hitouch.zip',
			workdir: '/tmp/hitouch',
		};

		// const agencyHolidays = await holidays.findMany({
		// 	agency_ids: { $in: [planData.gtfs_agency.agency_id] },
		// });

		// const datesMap = buildDatesMap(exportConfig.date_range, agencyHolidays);

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

		await plans.updateById(planData._id, {
			apps: {
				...planData.apps,
				posters: {
					...planData.apps.posters,
					status: 'complete',
					timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
				},
			},
		});

		//

		Logger.terminate(`Run took ${globalTimer.get()}`);

		//
	} catch (error) {
		Logger.error(error);
		throw error;
	}
}

/* * */

await runOnInterval(main, { intervalMs: '10s' });
