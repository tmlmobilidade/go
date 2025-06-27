/* * */

import { cleanupOrphanHashedShapes, cleanupOrphanHashedTrips, cleanupOrphanRidesGlobally } from '@/cleanup.js';
import { parsePlan } from '@/parse-plan.js';
import { validatePlan } from '@/validate-plan.js';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { plans } from '@tmlmobilidade/interfaces';

/* * */

async function main() {
	try {
		//

		LOGGER.init();

		const globalTimer = new TIMETRACKER();

		//
		// Get all Plans and iterate on each one

		const allPlansData = await plans.all();
		const allPlansDataSorted = allPlansData.sort((a, b) => b.gtfs_feed_info.feed_start_date.localeCompare(a.gtfs_feed_info.feed_start_date));

		LOGGER.info(`Found ${allPlansData.length} Plans to process...`);

		for (const [planIndex, currentPlan] of allPlansDataSorted.entries()) {
			try {
				//

				LOGGER.spacer(1);
				LOGGER.divider(`[${planIndex + 1}/${allPlansData.length}] - ${currentPlan._id}`);

				//
				// Validate the Plan data before processing

				const isValidPlan = validatePlan(currentPlan);
				if (!isValidPlan) continue;

				//
				// At this point, the plan will be processed.
				// Mark it as 'processing' to prevent multiple concurrent runs.

				await plans.updateById(currentPlan._id, { feeder_status: 'processing' });

				LOGGER.success(`Processing started: gtfs_feed_info.feed_start_date: ${currentPlan.gtfs_feed_info.feed_start_date} | gtfs_feed_info.feed_end_date: ${currentPlan.gtfs_feed_info.feed_end_date}`);

				//
				// Parse the plan into Rides

				await parsePlan(currentPlan);

				//
			}
			catch (error) {
				await plans.updateById(currentPlan._id, { feeder_status: 'error' });
				LOGGER.error(`Error processing plan ${currentPlan._id}`, error);
				LOGGER.divider();
			}
		}

		//
		// Perform the cleanup operations after processing all plans

		await cleanupOrphanRidesGlobally();
		await cleanupOrphanHashedShapes();
		await cleanupOrphanHashedTrips();

		//

		LOGGER.terminate(`Run took ${globalTimer.get()}`);

		//
	}
	catch (error) {
		LOGGER.error('An error occurred. Halting execution.', error);
		LOGGER.error('Retrying in 10 seconds...');
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
		setTimeout(runOnInterval, 60_000); // Run every 60 seconds
	};
	runOnInterval();
})();
