/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { performInChunks } from '@tmlmobilidade/utils';

/**
 * Remove rides that were previously parsed from this plan but which should not be included anymore.
 * Delete all rides for this plan_id that fall outside the current Plan valid range.
 * Because the amount of rides can be very large, we need to divide the deleteMany operation in chunks.
 * @param planId The ID of the Plan for which to cleanup orphan rides.
 * @param savedRideIds A Set of Ride IDs that are still in use by the Plan.
 */
export async function cleanupOrphanRidesForPlan(planId: string, savedRideIds: Set<string>) {
	//

	const timer = new Timer();

	Logger.spacer(1);
	Logger.info({ message: `Starting cleanup of orphan Rides for Plan "${planId}"...` });

	//
	// Setup a stream for all Ride IDs that are in use by Rides

	const existingRideIds: string[] = await labDb.operation.rides.distinct('_id', 'plan_id = $1', { 1: planId });
	const staleRideIds = new Set<string>();

	for (const rideId of existingRideIds) {
		// Skip if this ride is still in use
		if (savedRideIds.has(rideId)) continue;
		// Mark it as stale otherwise
		staleRideIds.add(rideId);
	}

	Logger.info({ message: `Will delete ${staleRideIds.size} stale rides for plan "${planId}". (${timer.get()})` });

	await performInChunks(Array.from(staleRideIds), async (chunk) => {
		await labDb.operation.rides.delete('_id IN ($1)', { 1: chunk.join(',') });
		Logger.info({ message: `Deleted ${chunk.length} stale rides for plan "${planId}"` });
	});

	Logger.info({ message: `Completed delete stale rides for plan "${planId}". (${timer.get()})` });

	//
}

/**
 * Delete all Rides from Plans that do not exist anymore.
 */
export async function cleanupOrphanRidesGlobally() {
	//

	const timer = new Timer();

	Logger.spacer(1);
	Logger.info({ message: `Starting cleanup of orphan Rides...` });

	const allPlanIds = await goDb.operation.plans.distinct('_id');

	await labDb.operation.rides.delete('plan_id NOT IN ($1)', { 1: allPlanIds.join(',') });

	Logger.success(`Deleted orphan Rides from Plans that do not exist anymore. (${timer.get()})`);
	Logger.spacer(1);

	//
}

/**
 * Delete all HashedShapes that are not referenced by any Ride.
 */
export async function cleanupOrphanHashedPaths() {
	//

	const timer = new Timer();

	Logger.spacer(1);
	Logger.info({ message: `Starting cleanup of orphan Hashed Paths...` });

	await labDb.operation.hashedPaths.delete('_id NOT IN (SELECT DISTINCT hashed_path_id FROM operation.rides)');

	Logger.success(`Hashed Paths cleanup complete. Deleted orphan Hashed Paths. (${timer.get()})`);

	//
}
