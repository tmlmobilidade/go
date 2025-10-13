/* * */

import { exportAgencyFile } from '@/exports/agency.js';
import { exportCalendarFiles } from '@/exports/calendars.js';
import { exportFeedInfoFile } from '@/exports/feed_info.js';
import { exportRoutesFile } from '@/exports/routes.js';
import { exportStopTimesFile } from '@/exports/stop-times.js';
import { exportStopsFile } from '@/exports/stops.js';
import { exportTripsFile } from '@/exports/trips.js';
import { type ExportToHitouchConfig } from '@/types.js';
import TIMETRACKER from '@helperkits/timer';
import { importGtfsToDatabase, type ImportGtfsToDatabaseConfig } from '@tmlmobilidade/import-gtfs';
import { plans } from '@tmlmobilidade/interfaces';
import { validateOperationalDate } from '@tmlmobilidade/types';
import { Logs } from '@tmlmobilidade/utils';
import fs from 'node:fs';

import { exportDayTypesFile } from './exports/day_types.js';

/* * */

(async function main() {
	try {
		//

		Logs.init();

		const globalTimer = new TIMETRACKER();

		//
		// Get single plan to process

		// const planData = await plans.findById('P1LDS'); // Teste Simples
		// const planData = await plans.findById('FPTD0'); // 41 Viação Alvorada
		const planData = await plans.findById('LA4CI'); // 42 Rodoviária de Lisboa
		// const planData = await plans.findById('BYBGK'); // 43 Transportes Sul do Tejo
		// const planData = await plans.findById('N8TKT'); // 44 Alsa Todi

		Logs.info(`Found Plan to process: ${planData._id}`);

		if (!planData) {
			Logs.info('Plan not found. Exiting...');
			return;
		}

		//
		// Import the Plan into a local SQLite database

		const importConfig: ImportGtfsToDatabaseConfig = {
			date_range: {
				end: validateOperationalDate('20501231'),
				start: validateOperationalDate('19900101'),
			},
		};

		const sqlGtfs = await importGtfsToDatabase(planData, importConfig);

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

		Logs.info(`Exporting to HiTouch GTFS...`);

		const exportTimer = new TIMETRACKER();

		await exportCalendarFiles(sqlGtfs, exportConfig);
		await exportTripsFile(sqlGtfs, exportConfig);
		await exportStopTimesFile(sqlGtfs, exportConfig);
		await exportRoutesFile(sqlGtfs, exportConfig);
		await exportStopsFile(sqlGtfs, exportConfig);
		await exportAgencyFile(planData, exportConfig);
		await exportFeedInfoFile(planData, exportConfig);
		await exportDayTypesFile(exportConfig);

		Logs.info(`Exported files in ${exportTimer.get()} seconds`);

		//

		Logs.terminate(`Run took ${globalTimer.get()}`);

		//
	}
	catch (error) {
		Logs.error(error);
	}
})();
