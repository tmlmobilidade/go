/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type RidesCoordinatorPlansResponse } from '@tmlmobilidade/go-operation-pckg-types';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

let IS_BUSY = false;

/* * */

export async function getPlans(): Promise<RidesCoordinatorPlansResponse> {
	//

	const timer = new Timer();
	const sessionId = Math.random().toString(36).substring(2, 5).toUpperCase();

	try {
		//

		//
		// The whole point of a coordinator is to prevent multiple instances
		// from processing the same documents at the same time. For that reason,
		// we need to make sure that instances request the next batch of documents
		// sequentially. To do that, we implement a simple lock mechanism.

		if (IS_BUSY) {
			Logger.info({ message: `[${sessionId}] Waiting for another request to complete... (elapsed: ${timer.get()})` });
			return { plan_id: null };
		}

		//
		// Set the busy flag to prevent other requests
		// from being processed until the current one is done.

		IS_BUSY = true;

		//
		// Find the next Plan that is waiting to be processed.
		// Sort the query by descending date to prioritize the most recent Plans.

		const fetchTimer = new Timer();

		const waitingPlans = await goDb.operation.plans.findMany(
			{
				'$expr': { $ne: ['$hash', '$apps.rides_feeder.last_hash'] },
				'apps.rides_feeder.status': { $in: ['waiting'] },
			},
			{
				limit: 1,
				projection: { _id: 1 },
				sort: { active_from: -1 },
			},
		);

		/* === FOR TESTING === */
		// const latestWaitingRides = await rides.findMany({ _id: 'DC0XN-44-20250303-4412_0_2|300|1955' })
		/* === FOR TESTING === */

		const fetchTimerResult = fetchTimer.get();

		if (!waitingPlans.length) {
			Logger.info({ message: `[${sessionId}] No plans waiting (fetch: ${fetchTimerResult})` });
			IS_BUSY = false;
			return { plan_id: null };
		}

		//
		// Mark the Plan as 'processing' to ensure the next batch of Plans does not include it,
		// and return them to the caller instance.

		const markTimer = new Timer();

		Logger.info({ message: `[${sessionId}] New plan: ${waitingPlans[0]._id} (fetch: ${fetchTimerResult} | total: ${markTimer.get()})` });

		IS_BUSY = false;

		return { plan_id: waitingPlans[0]._id };

		//
	} catch (error) {
		Logger.error({ error, message: `[${sessionId}] Error getting plans: ${error.message}` });
		IS_BUSY = false;
		return { plan_id: null };
	}
}
