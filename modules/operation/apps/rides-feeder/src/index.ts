/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { RidesCoordinatorPlansResponse } from '@tmlmobilidade/go-operation-pckg-types';
import { getCoordinatorUrl } from '@tmlmobilidade/go-operation-pckg-utils';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { parsePlan } from './parse-plan.js';
import { setPlanStatus } from './set-plan-status.js';

/* * */

async function main() {
	//

	//
	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'rides-feeder', message: 'Sentry Rides Feeder initialized', module: 'controller', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Rides Feeder' });
	}

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();

	//
	// Ask the coordinator for a new Plan ID to process

	const fetchCoordinatorTimer = new Timer();

	const planId = await fetch(getCoordinatorUrl('plans'))
		.then(response => response.json())
		.then(data => data as RidesCoordinatorPlansResponse)
		.then(data => data.plan_id);

	const fetchCoordinatorTimerResult = fetchCoordinatorTimer.get();

	//
	// Skip this run if there is no plan to process

	if (!planId) {
		Logger.info({ message: 'No plan to process. Skipping run.' });
		return;
	}

	const currentPlan = await goDb.operation.plans.findById(planId);

	if (!currentPlan) {
		Logger.error({ message: `Plan not found: ${planId}` });
		return;
	}

	//
	// Retrieve the current plan from the database

	Logger.info({ message: `Coordinator gave me this plan ID to process: ${planId} (fetch: ${fetchCoordinatorTimerResult})` });

	try {
		//

		Logger.spacer(1);
		Logger.divider(`Agency ${currentPlan.agency_id} - Plan ${currentPlan._id}`);

		//
		// Mark the plan as 'error' if it does not have an associated operation file

		if (!currentPlan.operation_file_id) {
			Logger.error({ message: `Skip processing: No operation file found.` });
			await setPlanStatus(currentPlan._id, 'error');
			return;
		}

		//
		// Mark the plan as 'processing' to prevent multiple concurrent runs.

		await setPlanStatus(currentPlan._id, 'processing');

		Logger.success(`Processing started: feed_start_date: ${currentPlan.gtfs_feed_info.feed_start_date} | feed_end_date: ${currentPlan.gtfs_feed_info.feed_end_date}`);
		Logger.spacer(1);

		//
		// Parse the plan into Rides

		await parsePlan(currentPlan);

		//
	} catch (error) {
		await setPlanStatus(currentPlan._id, 'error');
		Logger.error({ error, message: `Error processing plan ${currentPlan._id}` });
		Logger.divider();
	}

	Logger.terminate(`Run took ${globalTimer.get()}`);

	//
};

/* * */

await runOnInterval(main, { intervalMs: '1m' });
