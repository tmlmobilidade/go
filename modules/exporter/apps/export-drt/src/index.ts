/* * */

import { Dates } from '@tmlmobilidade/dates';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';
import os from 'node:os';

import { deleteAllAgencyDatabases, initializeDatabase } from './database.js';
import { GlobalContext } from './drt.types.js';
import { processor } from './processor.js';
import { saveAllAgencyDatabasesToStorage } from './storage.js';

/* * */

const DAYS_TO_ADD = 3;
const AGENCY_IDS = ['43', '41', '42', '44'];

export const GLOBAL_CONTEXT: GlobalContext = {
	configs: {
		agency_id: undefined,
		database_name: 'drt-model',
		database_path: os.tmpdir(),
		end_date: Dates.now('Europe/Lisbon').set({ hour: 4, millisecond: 0, minute: 0, second: 0 }).plus({ days: DAYS_TO_ADD }).unix_timestamp,
		start_date: Dates.now('Europe/Lisbon').set({ hour: 4, millisecond: 0, minute: 0, second: 0 }).unix_timestamp,
	},
	database: undefined,
	tables: undefined,
};

/* * */
/* MAIN FUNCTION */
async function main() {
	try {
		Logger.init();
		const globalTimer = new Timer();

		const baseConfig = {
			database_name: GLOBAL_CONTEXT.configs.database_name,
			database_path: GLOBAL_CONTEXT.configs.database_path,
		};

		// Delete all existing agency databases
		deleteAllAgencyDatabases(baseConfig, AGENCY_IDS);

		Logger.title(`Processing the DRT data`);

		// Process agency-specific data for each agency
		// Common data (agencies and stops) will be processed for each database
		for (const agencyId of AGENCY_IDS) {
			Logger.divider();
			Logger.title(`Processing agency ${agencyId}`);

			const agencyConfig = { ...baseConfig, agency_id: agencyId };
			const { database, tables } = initializeDatabase(agencyConfig);

			GLOBAL_CONTEXT.tables = tables;
			GLOBAL_CONTEXT.configs.agency_id = agencyId;
			GLOBAL_CONTEXT.database = database;

			await processor();

			database.databaseInstance.close();
		}

		Logger.success(`Finished processing the DRT data in ${globalTimer.get()}.`);

		// Save all databases to storage
		// Comment out the line below to skip uploading to storage during development
		await saveAllAgencyDatabasesToStorage(baseConfig, AGENCY_IDS);

		Logger.terminate('DRT export completed successfully.');
	} catch (error) {
		Logger.error('Error parsing plan.', error);
		throw error;
	}
}

/* * */

await runOnInterval(main, { intervalMs: 36_000_000 }); // 10 hours
