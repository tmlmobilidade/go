/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { getPlanHash } from '@tmlmobilidade/go-operation-pckg-utils';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/**
 * This task makes sure the associated GTFS files of plan documents have the correct
 * agency.txt and feed_info.txt information, and that the shape_id values of trips.txt
 * and shapes.txt match the pattern_id of each trip.
 * This will download the zip archive, unzip it, check and update the necessary files,
 * re-zip it and upload it again, for each plan document.
 */
export async function updatePlanHashesTask() {
	//

	Logger.init();

	const globalTimer = new Timer();

	//
	// Fetch all plans from the database

	const allPlans = await goDb.operation.plans.findMany({}, { sort: { active_from: -1 } });

	Logger.info({ message: `Found ${allPlans.length} plans.` });

	//
	// Update the hash for each plan

	for (const [index, planData] of allPlans.entries()) {
		try {
			//

			const timer = new Timer();

			console.log(`[${allPlans.length - index}/${allPlans.length}] Processing plan ${planData._id}`);

			const newHashValue = await getPlanHash({
				activeFrom: planData.active_from,
				activeUntil: planData.active_until,
				operationFileId: planData.operation_file_id,
				planId: planData._id,
			});

			await goDb.operation.plans.updateById(planData._id, {
				hash: newHashValue,
			});

			Logger.success(`Updated hash for plan ${planData._id} in ${timer.get()}`);

			//
		} catch (error) {
			Logger.error({ error: error as Error, message: `Failed to update hash for plan ${planData._id}` });
			continue;
		}
	}

	Logger.terminate(`Plan hashes updated in ${globalTimer.get()}`);
}
