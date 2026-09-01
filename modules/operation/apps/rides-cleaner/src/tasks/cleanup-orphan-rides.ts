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

	await labDb.operation.rides.delete('plan_id NOT IN ($1)', { 1: allPlanIds.join(',') });

	Logger.success(`Deleted orphan Rides from Plans that do not exist anymore. (${timer.get()})`);
	Logger.spacer(1);
}
