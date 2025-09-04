/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { SQLiteWriter } from '@tmlmobilidade/connectors';
import { plans } from '@tmlmobilidade/interfaces';
import { Dates } from '@tmlmobilidade/utils';

import { importGtfsToDatabase, ImportGtfsToDatabaseConfig } from './import-gtfs-to-database.js';

const DAYS_TO_ADD = 3;

/* * */

async function main() {
	try {
		//

		LOGGER.init();

		const globalTimer = new TIMETRACKER();

		//
		// Get all Plans and iterate on each one
		const startDate = Dates.now('Europe/Lisbon');
		const endDate = Dates.now('Europe/Lisbon').plus({ days: DAYS_TO_ADD });

		const foundPlans = await plans.findMany({
			// 'gtfs_feed_info.feed_start_date': { $gte: Dates.now('Europe/Lisbon').unix_timestamp },
			// /* * */
			// 'gtfs_feed_info.feed_end_date': { $lte: Dates.now('Europe/Lisbon').plus({ days: DAYS_TO_ADD }).unix_timestamp },
			// ! DEBUG
			$or: [
				{ _id: 'BD1BD' },
				{ _id: 'L2FV7' },
			],
		}, { sort: { 'gtfs_feed_info.feed_start_date': -1 } });

		LOGGER.info(`Found ${foundPlans.length} Plans to process...`);

		if (foundPlans.length === 0) {
			LOGGER.info('No plans to process. Exiting...');
			return;
		}

		//
		// Insert All plans to the local SQLite database

		const importConfig: ImportGtfsToDatabaseConfig = {
			endDate: endDate.plus({ days: DAYS_TO_ADD }).operational_date,
			startDate: startDate.operational_date,
		};
		const sqlWriters = await importGtfsToDatabase(foundPlans, importConfig);

		//
		// Log the SQL writers

		for (const sqlWriter of Object.values(sqlWriters)) {
			if (sqlWriter instanceof SQLiteWriter) {
				LOGGER.info(`SQLite writer instance path: ${sqlWriter.instancePath}`);
			}
		}

		//

		LOGGER.terminate(`Run took ${globalTimer.get()}`);

		await new Promise(resolve => setTimeout(resolve, 600_000)); // 10 minutes

		//
	}
	catch (error) {
		LOGGER.error(error);
	}
}

/* * */

(async function init() {
	const runOnInterval = async () => {
		await main();
		setTimeout(runOnInterval, 86_400_000); // 1 Day
	};
	runOnInterval();
})();
