/* * */

import { exportCalendarFiles } from '@/exports/calendar-files.js';
import { exportRoutesFile } from '@/exports/routes.js';
import { exportShapesFile } from '@/exports/shapes.js';
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
			day_types: {

				//
				// School dates

				DT_ESC_DOM: [
					validateOperationalDate('20251012'),
				],
				DT_ESC_DU: [
					validateOperationalDate('20251006'),
					validateOperationalDate('20251007'),
					validateOperationalDate('20251008'),
					validateOperationalDate('20251009'),
					validateOperationalDate('20251010'),
				],
				DT_ESC_SAB: [
					validateOperationalDate('20251011'),
				],

				//
				// Holiday dates

				DT_FER_DOM: [
					validateOperationalDate('20251221'),
				],
				DT_FER_DU: [
					validateOperationalDate('20251222'),
					validateOperationalDate('20251223'),
					validateOperationalDate('20251224'),
					validateOperationalDate('20251225'),
					validateOperationalDate('20251226'),
				],
				DT_FER_SAB: [
					validateOperationalDate('20251220'),
				],

				//
				// Summer dates

				DT_VER_DOM: [
					validateOperationalDate('20250803'),
				],
				DT_VER_DU: [
					validateOperationalDate('20250804'),
					validateOperationalDate('20250805'),
					validateOperationalDate('20250806'),
					validateOperationalDate('20250807'),
					validateOperationalDate('20250808'),
				],
				DT_VER_SAB: [
					validateOperationalDate('20250802'),
				],

			},
			output: 'export-hitouch.zip',
			workdir: '/tmp/hitouch',
		};

		//
		// Import the Plan into a local SQLite database

		const importConfig: ImportGtfsToDatabaseConfig = {
			discrete_dates: Array.from(new Set(Object.values(exportConfig.day_types).flat())),
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
		await exportShapesFile(sqlGtfs, exportConfig);
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
