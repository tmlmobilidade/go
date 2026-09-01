/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export async function cleanStuckPlans() {
	//

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();

	//
	// Get all 'processing' plans from the database

	const fetchTimerA = new Timer();

	const processingPlansA = await goDb.operation.plans.findMany({ 'apps.controller.status': ['processing'] });
	const processingPlanIdsA = processingPlansA.map(item => item._id);

	const fetchTimerResultA = fetchTimerA.get();

	Logger.info({ message: `A: Fetched ${processingPlanIdsA.length} 'processing' plans. (${fetchTimerResultA})` });

	//
	// Wait 15 minutes before checking again

	await new Promise(resolve => setTimeout(resolve, 900_000)); // 15 minutes

	//
	// It is unlikely for a Plan to be in the processing state for more than 30 minutes.
	// If it takes longer than that, then something happened (like a restart of the feeder
	// responsible for that plan) and the plan is considered stuck.
	// It should be marked as 'waiting' to be reprocessed.

	const fetchTimerB = new Timer();

	const processingPlansB = await goDb.operation.plans.findMany({ 'apps.controller.status': ['processing'] });
	const processingPlanIdsB = processingPlansB.map(item => item._id);

	const fetchTimerResultB = fetchTimerB.get();

	Logger.info({ message: `B: Fetched ${processingPlanIdsB.length} 'processing' plans. (${fetchTimerResultB})` });

	//
	// Wait another 15 minutes before checking again

	await new Promise(resolve => setTimeout(resolve, 900_000)); // 15 minutes

	//
	// Refetch the procesing plans a third time to make sure
	// we are not marking plans as stuck unnecessarily.

	const fetchTimerC = new Timer();

	const processingPlansC = await goDb.operation.plans.findMany({ 'apps.controller.status': ['processing'] });
	const processingPlanIdsC = processingPlansC.map(item => item._id);

	const fetchTimerResultC = fetchTimerC.get();

	Logger.info({ message: `C: Fetched ${processingPlanIdsC.length} 'processing' plans. (${fetchTimerResultC})` });

	//
	// Now, we have three lists of stuck plans. We need to find the plans that are present
	// in the 3 lists to avoid reprocessing plans that were already reprocessed.

	const stuckPlanIds = processingPlanIdsA.filter(id => processingPlanIdsB.includes(id) && processingPlanIdsC.includes(id));

	//
	// Mark the plans as 'waiting' to be reprocessed.

	if (stuckPlanIds.length > 0) {
		Logger.info({ message: `Found ${stuckPlanIds.length} stuck plans that will be marked as 'waiting'.` });
		const plansCollection = await goDb.operation.plans.getCollection();
		await plansCollection.updateMany({ _id: { $in: stuckPlanIds } }, { $set: { 'apps.controller.status': 'waiting' } });
	} else {
		Logger.info({ message: `No stuck plans found!` });
		Logger.spacer(1);
	}

	Logger.terminate(`Cleaned ${stuckPlanIds.length} stuck plans in ${globalTimer.get()}.`);
};
