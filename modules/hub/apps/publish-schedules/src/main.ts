/* * */

import { validatePlan } from '@/validate-plan.js';
import { Dates } from '@tmlmobilidade/dates';
import { importGtfsToDatabase, type ImportGtfsToDatabaseConfig, initImportGtfsToDatabaseContext } from '@tmlmobilidade/import-gtfs';
import { plans } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import crypto from 'node:crypto';

/* * */

import { generateLines } from './tasks-new/lines.js';

/* * */

let PREVIOUS_PLANS_LIST_HASH: null | string = null;

/* * */

export async function main() {
	//

	const globalTimer = new Timer();

	//
	// Retrieve all Plans from the database
	// and iterate on each one.

	const allPlansData = await plans.findMany({ _id: 'GX1NE' }, { sort: { 'gtfs_feed_info.feed_start_date': 1 } });

	if (allPlansData.length === 0) return Logger.terminate('No Plans found. Exiting...');

	Logger.info(`Found ${allPlansData.length} Plans to process...`);

	//
	// Hash the allPlansData response and check if it differs
	// from the last processed hash stored in memory. This way,
	// if no Plans were changed/added/removed since the last export,
	// we can skip the entire export process.

	const currentPlansListHash = crypto
		.createHash('sha1')
		.update(JSON.stringify(allPlansData.map(plan => plan.hash)))
		.digest('hex');

	if (PREVIOUS_PLANS_LIST_HASH === currentPlansListHash) {
		return Logger.terminate('No changes detected in Plans list since last export. Skipping this run...');
	}

	PREVIOUS_PLANS_LIST_HASH = currentPlansListHash;

	//
	// Mark those plans as 'waiting' in the database.

	// for (const planData of allPlansData) {
	// 	await plans.updateById(planData._id, { apps: { ...planData.apps, hub_schedules: { last_hash: null, status: 'waiting', timestamp: Dates.now('Europe/Lisbon').unix_timestamp } } }, { forceIfLocked: true });
	// }

	//
	// Set up the initial context for the import process.
	// This will be used to store the GTFS data for each plan.

	const initialImportGtfsContext = await initImportGtfsToDatabaseContext();

	//
	// For each plan, validate it and import its GTFS into
	// a database and cut it according to the plan's feed_info dates.
	// Use the initial context for the import process.

	for (const [planIndex, planData] of allPlansData.entries()) {
		try {
			//

			Logger.info(`[${planIndex + 1}/${allPlansData.length}] - Agency ${planData.gtfs_agency.agency_id} - Plan ${planData._id}`);

			//
			// Validate the Plan data before processing.
			// If the plan is invalid, skip to the next one
			// and mark it as 'skipped' in the database.
			// Otherwise, mark it as 'processing'.

			const isValidPlan = validatePlan(planData);

			if (!isValidPlan) {
				await plans.updateById(planData._id, { apps: { ...planData.apps, hub_schedules: { last_hash: null, status: 'skipped', timestamp: Dates.now('Europe/Lisbon').unix_timestamp } } }, { forceIfLocked: true });
				Logger.info(`Skipped plan ${planData._id} due to validation errors.`);
				continue;
			}

			await plans.updateById(planData._id, { apps: { ...planData.apps, hub_schedules: { last_hash: null, status: 'processing', timestamp: Dates.now('Europe/Lisbon').unix_timestamp } } }, { forceIfLocked: true });

			//
			// Find out if this plan is a currently active plan.
			// Active plans are those whose feed_info dates
			// encompass the current date, and should be cut only at the end,
			// not at the start, as to be able to provide a full year of data.

			const importConfig: ImportGtfsToDatabaseConfig = {
				date_range: {
					end: planData.gtfs_feed_info.feed_end_date,
					start: planData.gtfs_feed_info.feed_start_date,
				},
			};

			//
			// Import the GTFS into a SQLite database.
			// Let the function handle the parsing and cutting,
			// and return table instances with processed data.

			const importTimer = new Timer();

			await importGtfsToDatabase(planData, importConfig, initialImportGtfsContext);

			Logger.success(`Imported plan ${planData._id} in ${importTimer.get()}.`);

			//
		} catch (error) {
			await plans.updateById(planData._id,	{ apps: { ...planData.apps, hub_schedules: { last_hash: null, status: 'error', timestamp: Dates.now('Europe/Lisbon').unix_timestamp } } }, { forceIfLocked: true });
			Logger.error(`Error processing plan ${planData._id}`, error);
			Logger.divider();
		}
	}

	//
	// Export GTFS files from the merged dataset

	await generateLines(initialImportGtfsContext);

	//
	// Finalize the export process

	Logger.terminate(`Run took ${globalTimer.get()}`);

	//
}
