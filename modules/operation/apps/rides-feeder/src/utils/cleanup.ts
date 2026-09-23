/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { performInChunks } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

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

	const ridesCollection = await goDb.operation.rides.getCollection();

	const existingRideIdsStream: AsyncIterable<{ _id: string }> = ridesCollection
		.find({ plan_id: planId })
		.project({ _id: 1 })
		.stream();

	//
	// Iterate over the stream and collect the ride IDs

	const staleRideIds = new Set<string>();

	for await (const item of existingRideIdsStream) {
		// Skip if this ride is still in use
		if (savedRideIds.has(item._id)) continue;
		// Mark it as stale otherwise
		staleRideIds.add(item._id);
	}

	Logger.info({ message: `Will delete ${staleRideIds.size} stale rides for plan "${planId}". (${timer.get()})` });

	await performInChunks(Array.from(staleRideIds), async (chunk) => {
		await goDb.operation.rides.deleteMany({ _id: { $in: chunk } });
		Logger.info({ message: `Deleted ${chunk.length} stale rides for plan "${planId}"` });
	}, 500);

	Logger.info({ message: `Completed delete stale rides for plan "${planId}". (${timer.get()})` });

	//
}
