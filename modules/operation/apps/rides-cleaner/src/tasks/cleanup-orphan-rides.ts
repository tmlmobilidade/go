/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/**
 * Delete all Rides from Plans that do not exist anymore.
 */
export async function cleanupOrphanRides() {
	//

	const timer = new Timer();

	Logger.spacer(1);
	Logger.info({ message: `Starting cleanup of orphan Rides...` });

	const allPlanIds = await goDb.operation.plans.distinct('_id');

	if (!allPlanIds.length) {
		Logger.info({ message: `No plans found!` });
		return;
	}

	const result = await labDb.command({
		query: 'ALTER TABLE operation.rides DELETE WHERE plan_id NOT IN ({planIds:Array(String)})',
		query_params: { planIds: allPlanIds },
	});

	Logger.success(`Deleted ${result.summary.result_rows} orphan Rides from Plans that do not exist anymore. (${timer.get()})`);
	Logger.spacer(1);
}
