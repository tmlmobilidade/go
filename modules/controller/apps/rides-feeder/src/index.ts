/* * */

import { cleanupOrphanHashedPatterns, cleanupOrphanHashedShapes, cleanupOrphanHashedTrips, cleanupOrphanRidesGlobally } from '@/cleanup.js';
import { parsePlan } from '@/parse-plan.js';
import { Dates } from '@tmlmobilidade/dates';
import { plans } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger/sentry/node';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

async function main() {
	try {
		//

		//
		// Initialize Sentry

		try {
			await initSentryNode();
			Logger.info('');
			Logger.logsNode({ app: 'rides-feeder', message: 'Sentry Rides Feeder initialized', module: 'controller', severity: 'info' });
		} catch {
			Logger.error('Error initializing Sentry Rides Feeder');
		}

		Logger.init();

		const globalTimer = new Timer();

		//
		// Get all Plans and iterate on each one

		const plansCollection = await plans.getCollection();

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
				// Only process Plans for specific agency IDs

				if (!['1', '2', '4', '8', '15', '16', '21', '41', '42', '43', '44'].includes(currentPlan.gtfs_agency?.agency_id)) {
					Logger.error(`Skip processing: gtfs_agency is '${currentPlan.gtfs_agency?.agency_id}'. Only '1', '2', '4', '8', '15', '16', '21', '41', '42', '43', or '44' are allowed.`);
					await plansCollection.updateOne({ _id: { $eq: currentPlan._id } }, { $set: { 'apps.controller.last_hash': null, 'apps.controller.status': 'skipped', 'apps.controller.timestamp': Dates.now('Europe/Lisbon').unix_timestamp } });
					continue;
				}

				//
				// If the hash is the same continue
				// as it means the plan did not change since last run

				if (currentPlan.hash === currentPlan.apps?.controller?.last_hash) {
					Logger.error(`Skip processing: Hash is the same as last_hash.`);
					continue;
				}

				//
				// Skip if its status is 'error'

				if (currentPlan.apps?.controller?.status === 'error') {
					Logger.error(`Skip processing: status_controller is 'error'.`);
					continue;
				}

				//
				// Mark as error if it does not have an associated operation file

				if (!currentPlan.operation_file_id) {
					Logger.error(`Skip processing: No operation file found.`);
					await plansCollection.updateOne({ _id: { $eq: currentPlan._id } }, { $set: { 'apps.controller.last_hash': null, 'apps.controller.status': 'error', 'apps.controller.timestamp': Dates.now('Europe/Lisbon').unix_timestamp } });
					continue;
				}

				//
				// At this point, the plan will be processed.
				// Mark it as 'processing' to prevent multiple concurrent runs.

				await plansCollection.updateOne({ _id: { $eq: currentPlan._id } }, { $set: { 'apps.controller.status': 'processing' } });

				Logger.success(`Processing started: feed_start_date: ${currentPlan.gtfs_feed_info.feed_start_date} | feed_end_date: ${currentPlan.gtfs_feed_info.feed_end_date}`);
				Logger.spacer(1);

				//
				// Parse the plan into Rides

				await parsePlan(currentPlan);

				//
			} catch (error) {
				await plansCollection.updateOne({ _id: { $eq: currentPlan._id } }, { $set: { 'apps.controller.last_hash': null, 'apps.controller.status': 'error', 'apps.controller.timestamp': Dates.now('Europe/Lisbon').unix_timestamp } });
				Logger.error(`Error processing plan ${currentPlan._id}`, error);
				Logger.divider();
			}
		}

		//
		// Perform the cleanup operations after processing all plans

		await cleanupOrphanRidesGlobally();
		await cleanupOrphanHashedPatterns();
		await cleanupOrphanHashedShapes();
		await cleanupOrphanHashedTrips();

		//

		Logger.terminate(`Run took ${globalTimer.get()}`);

		//
	} catch (error) {
		Logger.error('An error occurred. Halting execution.', error);
		Logger.error('Retrying in 10 seconds...');
		setTimeout(() => {
			process.exit(1); // End process
		}, 10000); // after 10 seconds
	}

	//
};

/* * */

await runOnInterval(main, { intervalMs: '1m' });
