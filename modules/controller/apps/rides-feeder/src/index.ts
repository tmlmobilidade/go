/* * */

import { cleanupOrphanHashedShapes, cleanupOrphanHashedTrips, cleanupOrphanRidesGlobally } from '@/cleanup.js';
import { parsePlan } from '@/parse-plan.js';
import { validatePlan } from '@/validate-plan.js';
import { Dates } from '@tmlmobilidade/dates';
import { plans } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

async function main() {
	try {
		//

		Logger.init();

		const globalTimer = new Timer();

		//
		// Get all Plans and iterate on each one

		const allPlansData = await plans.all();

		if (allPlansData.length === 0) return Logger.terminate('No Plans found. Exiting...');

		const allPlansDataSorted = allPlansData.sort((a, b) => (b.gtfs_feed_info?.feed_start_date || '').localeCompare(a.gtfs_feed_info?.feed_start_date || ''));

		Logger.info(`Found ${allPlansData.length} Plans to process...`);

		for (const [planIndex, currentPlan] of allPlansDataSorted.entries()) {
			try {
				//

				Logger.spacer(1);
				Logger.divider(`[${planIndex + 1}/${allPlansData.length}] - Agency ${currentPlan.gtfs_agency.agency_id} - Plan ${currentPlan._id}`);

				//
				// Validate the Plan data before processing

				const isValidPlan = validatePlan(currentPlan);
				if (!isValidPlan) continue;

				//
				// At this point, the plan will be processed.
				// Mark it as 'processing' to prevent multiple concurrent runs.

				await plans.updateById(currentPlan._id, {
					apps: {
						...currentPlan.apps,
						controller: {
							...currentPlan.apps.controller,
							status: 'processing',
						} },
				});

				Logger.success(`Processing started: feed_start_date: ${currentPlan.gtfs_feed_info.feed_start_date} | feed_end_date: ${currentPlan.gtfs_feed_info.feed_end_date}`);
				Logger.spacer(1);

				//
				// Parse the plan into Rides

				await parsePlan(currentPlan);

				//
			}
			catch (error) {
				await plans.updateById(currentPlan._id, {
					apps: {
						...currentPlan.apps,
						controller: {
							last_hash: null,
							status: 'error',
							timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
						},
					},
				});
				Logger.error(`Error processing plan ${currentPlan._id}`, error);
				Logger.divider();
			}
		}

		//
		// Perform the cleanup operations after processing all plans

		await cleanupOrphanRidesGlobally();
		await cleanupOrphanHashedShapes();
		await cleanupOrphanHashedTrips();

		//

		Logger.terminate(`Run took ${globalTimer.get()}`);

		//
	}
	catch (error) {
		Logger.error('An error occurred. Halting execution.', error);
		Logger.error('Retrying in 10 seconds...');
		setTimeout(() => {
			process.exit(0); // End process
		}, 10000); // after 10 seconds
	}

	//
};

/* * */

(async function init() {
	const runOnInterval = async () => {
		await main();
		setTimeout(runOnInterval, 60_000); // 1 minute
	};
	runOnInterval();
})();
