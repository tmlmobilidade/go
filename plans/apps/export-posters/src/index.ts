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

/* * */

(async function main() {
	try {
		//

		Logs.init();

		const globalTimer = new TIMETRACKER();

		//
		// Get single plan to process

		const planData = await plans.findById('FPTD0');

		Logs.info(`Found Plan to process: ${planData._id}`);

		if (!planData) {
			Logs.info('Plan not found. Exiting...');
			return;
		}

		//
		// Setup the export config

		const exportConfig: ExportToHitouchConfig = {
			day_types: {
				DT_ESC_DOM: validateOperationalDate('20250101'),
				DT_ESC_DU: validateOperationalDate('20250101'),
				DT_ESC_SAB: validateOperationalDate('20250101'),
				DT_FER_DOM: validateOperationalDate('20250101'),
				DT_FER_DU: validateOperationalDate('20250101'),
				DT_FER_SAB: validateOperationalDate('20250101'),
				DT_VER_DOM: validateOperationalDate('20250101'),
				DT_VER_DU: validateOperationalDate('20250101'),
				DT_VER_SAB: validateOperationalDate('20250101'),
			},
			output: 'export-hitouch.zip',
			workdir: './exports/hitouch',
		};

		//
		// Import the Plan into a local SQLite database

		const importConfig: ImportGtfsToDatabaseConfig = {
			discrete_dates: Object.values(exportConfig.day_types),
		};

		const sqlGtfs = await importGtfsToDatabase(planData, importConfig);

		//
		// Start the export process

		Logs.info(`Exporting to HiTouch GTFS...`);

		const exportTimer = new TIMETRACKER();

		exportCalendarFiles(sqlGtfs, exportConfig);
		exportTripFile(sqlGtfs, exportConfig);
		exportRoutesFile(sqlGtfs, exportConfig);
		exportShapesFile(sqlGtfs, exportConfig);
		exportStopTimesFile(sqlGtfs, exportConfig);
		exportStopsFile(sqlGtfs, exportConfig);

		Logs.info(`Exported files in ${exportTimer.get()} seconds`);

		//

		Logs.terminate(`Run took ${globalTimer.get()}`);

		//
	}
	catch (error) {
		Logs.error(error);
	}
})();
