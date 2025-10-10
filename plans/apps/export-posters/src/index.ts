/* * */

import { exportCalendarFiles } from '@/exports/calendar-files.js';
import { exportRoutesFile } from '@/exports/routes.js';
import { exportStopTimesFile } from '@/exports/stop-times.js';
import { exportStopsFile } from '@/exports/stops.js';
import { exportTripFile } from '@/exports/trips.js';
import { type ExportToHitouchConfig } from '@/types.js';
import TIMETRACKER from '@helperkits/timer';
import { importGtfsToDatabase, type ImportGtfsToDatabaseConfig } from '@tmlmobilidade/import-gtfs';
import { plans } from '@tmlmobilidade/interfaces';
import { validateOperationalDate } from '@tmlmobilidade/types';
import { Logs } from '@tmlmobilidade/utils';
import fs from 'node:fs';

import { mergeServiceIds } from './merge-calendars.js';

/* * */

(async function main() {
	try {
		//

		Logs.init();

		const globalTimer = new TIMETRACKER();

		//
		// Get single plan to process

		const planData = await plans.findById('BYBGK');

		Logs.info(`Found Plan to process: ${planData._id}`);

		if (!planData) {
			Logs.info('Plan not found. Exiting...');
			return;
		}

		//
		// Setup the export config

		const exportConfig: ExportToHitouchConfig = {
			output: 'export-hitouch.zip',
			workdir: '/tmp/hitouch',
		};

		//
		// Import the Plan into a local SQLite database

		const importConfig: ImportGtfsToDatabaseConfig = {
			date_range: {
				end: validateOperationalDate('20501231'),
				start: validateOperationalDate('20010101'),
			},
		};

		const sqlGtfs = await importGtfsToDatabase(planData, importConfig);

		//
		// Merge calendars

		mergeServiceIds(sqlGtfs);

		//
		// Start the export process

		Logs.info(`Exporting to HiTouch GTFS...`);

		if (fs.existsSync(exportConfig.workdir)) {
			fs.rmSync(exportConfig.workdir, { recursive: true });
		}
		fs.mkdirSync(exportConfig.workdir, { recursive: true });

		const exportTimer = new TIMETRACKER();

		await exportCalendarFiles(sqlGtfs, exportConfig);
		await exportTripFile(sqlGtfs, exportConfig);
		await exportRoutesFile(sqlGtfs, exportConfig);
		await exportStopTimesFile(sqlGtfs, exportConfig);
		await exportStopsFile(sqlGtfs, exportConfig);

		Logs.info(`Exported files in ${exportTimer.get()} seconds`);

		//

		Logs.terminate(`Run took ${globalTimer.get()}`);

		//
	}
	catch (error) {
		Logs.error(error);
	}
})();
