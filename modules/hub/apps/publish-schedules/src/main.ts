/* * */

import { generateLinesRoutesPatterns } from '@/tasks/sync-lines-routes-patterns.js';
import { generateStops } from '@/tasks/sync-stops.js';
import { validatePlan } from '@/validate-plan.js';
import { Dates } from '@tmlmobilidade/dates';
import { importGtfsToDatabase, type ImportGtfsToDatabaseConfig } from '@tmlmobilidade/import-gtfs-new';
import { plans } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import crypto from 'node:crypto';

/* * */

let PREVIOUS_PLANS_LIST_HASH: null | string = null;

/* * */

export async function main() {
	//

	const globalTimer = new Timer();

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
	// Set up the import config

	const importConfig: ImportGtfsToDatabaseConfig = {
		date_range: {
			end: planData.gtfs_feed_info.feed_end_date,
			start: planData.gtfs_feed_info.feed_start_date,
		},
		download_url: '',
	};

	const importResult = await importGtfsToDatabase(importConfig);

	//
	// Export GTFS files from the merged dataset

	await generateStops(initialImportGtfsContext);

	await generateLinesRoutesPatterns(initialImportGtfsContext);

	//
	// Finalize the export process

	Logger.terminate(`Run took ${globalTimer.get()}`);

	//
}
