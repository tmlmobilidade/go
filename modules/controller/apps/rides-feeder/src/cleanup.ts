/* * */

import { hashedPatterns, hashedShapes, hashedTrips, plans, rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { performInChunks } from '@tmlmobilidade/utils';

/* * */

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
	Logger.info(`Starting cleanup of orphan Rides for Plan "${planId}"...`);

	//
	// Setup a stream for all Ride IDs that are in use by Rides

	const ridesCollection = await rides.getCollection();

	const existingRidesStream = ridesCollection.find({ plan_id: planId }).stream();
	const staleRideIds = new Set<string>();

	for await (const existingRide of existingRidesStream) {
		// Skip if this ride is still in use
		if (savedRideIds.has(existingRide._id)) continue;
		// Mark it as stale otherwise
		staleRideIds.add(existingRide._id);
	}

	await performInChunks(Array.from(staleRideIds), async (chunk) => {
		const deleteStaleRidesResult = await rides.deleteMany({ _id: { $in: chunk } });
		Logger.info(`Deleted ${deleteStaleRidesResult.deletedCount} stale rides for plan "${planId}"`);
	});

	Logger.info(`Completed delete stale rides for plan "${planId}". (${timer.get()})`);

	//
}

/* * */

/**
 * Delete all Rides from Plans that do not exist anymore.
 */
export async function cleanupOrphanRidesGlobally() {
	//

	const timer = new Timer();

	Logger.spacer(1);
	Logger.info(`Starting cleanup of orphan Rides...`);

	const allPlansData = await plans.all();
	const allPlanIds = allPlansData.map(plan => plan._id);

	const deleteOrphanRidesResult = await rides.deleteMany({ plan_id: { $nin: allPlanIds } });

	Logger.success(`Deleted ${deleteOrphanRidesResult.deletedCount} orphan Rides from Plans that do not exist anymore. (${timer.get()})`);
	Logger.spacer(1);

	//
}

/* * */

/**
 * Delete all HashedShapes that are not referenced by any Ride.
 */
export async function cleanupOrphanHashedShapes() {
	//

	const timer = new Timer();

	Logger.spacer(1);
	Logger.info(`Starting cleanup of orphan Hashed Shapes...`);

	//
	// Setup a stream for all Hashed Shape IDs that are in use by Rides

	const ridesCollection = await rides.getCollection();
	const hashedShapeIdsInUseStream = ridesCollection.aggregate([{ $group: { _id: '$hashed_shape_id' } }]).stream();

	//
	// Setup a stream of all Hashed Shape IDs
	// and collect them in two Sets.

	const hashedShapesCollection = await hashedShapes.getCollection();
	const allHashedShapeIdsStream = hashedShapesCollection.aggregate([{ $group: { _id: '$_id' } }]).stream();

	const hashedShapeIdsInUse = new Set<string>();
	const orphanHashedShapeIds = new Set<string>();

	for await (const item of allHashedShapeIdsStream) {
		orphanHashedShapeIds.add(item._id);
	}

	for await (const item of hashedShapeIdsInUseStream) {
		hashedShapeIdsInUse.add(item._id);
	}

	//
	// Remove all Hashed Shape IDs that are in use from the Set of orphan Hashed Shape IDs.
	// This will leave us with only the orphan Hashed Shape IDs.

	hashedShapeIdsInUse.forEach(hashedShapeIdInUse => orphanHashedShapeIds.delete(hashedShapeIdInUse));

	Logger.info(`Hashed Shapes cleanup progress: In use: ${hashedShapeIdsInUse.size} | Orphan: ${orphanHashedShapeIds.size} (${timer.get()})`);

	//
	// Delete all orphan Hashed Shapes in chunks

	await performInChunks(Array.from(orphanHashedShapeIds), async (chunk) => {
		const result = await hashedShapes.deleteMany({ _id: { $in: chunk } });
		Logger.info(`Deleted ${result.deletedCount} orphan Hashed Shapes.`);
	});

	Logger.success(`Hashed Shapes cleanup complete. Deleted ${orphanHashedShapeIds.size} orphan Hashed Shapes. (${timer.get()})`);

	//
}

/* * */

/**
 * Delete all HashedTrips that are not referenced by any Ride.
 */
export async function cleanupOrphanHashedTrips() {
	//

	const timer = new Timer();

	Logger.spacer(1);
	Logger.info(`Starting cleanup of orphan Hashed Trips...`);

	//
	// Setup a stream for all Hashed Trip IDs that are in use by Rides

	const ridesCollection = await rides.getCollection();
	const hashedTripIdsInUseStream = ridesCollection.aggregate([{ $group: { _id: '$hashed_trip_id' } }]).stream();

	//
	// Setup a stream of all Hashed Trip IDs
	// and collect them in two Sets.

	const hashedTripsCollection = await hashedTrips.getCollection();
	const allHashedTripIdsStream = hashedTripsCollection.aggregate([{ $group: { _id: '$_id' } }]).stream();

	const hashedTripIdsInUse = new Set<string>();
	const orphanHashedTripIds = new Set<string>();

	for await (const item of allHashedTripIdsStream) {
		orphanHashedTripIds.add(item._id);
	}

	for await (const item of hashedTripIdsInUseStream) {
		hashedTripIdsInUse.add(item._id);
	}

	//
	// Remove all Hashed Trip IDs that are in use from the Set of orphan Hashed Trip IDs.
	// This will leave us with only the orphan Hashed Trip IDs.

	hashedTripIdsInUse.forEach(hashedTripIdInUse => orphanHashedTripIds.delete(hashedTripIdInUse));

	Logger.info(`Hashed Trips cleanup progress: In use: ${hashedTripIdsInUse.size} | Orphan: ${orphanHashedTripIds.size} (${timer.get()})`);

	//
	// Delete all orphan Hashed Trips in chunks

	await performInChunks(Array.from(orphanHashedTripIds), async (chunk) => {
		const result = await hashedTrips.deleteMany({ _id: { $in: chunk } });
		Logger.info(`Deleted ${result.deletedCount} orphan Hashed Trips.`);
	});

	Logger.success(`Hashed Trips cleanup complete. Deleted ${orphanHashedTripIds.size} orphan Hashed Trips. (${timer.get()})`);

	//
}

/* * */

/**
 * Delete all HashedPatterns that are not referenced by any Ride.
 */
export async function cleanupOrphanHashedPatterns() {
	//

	const timer = new Timer();

	Logger.spacer(1);
	Logger.info(`Starting cleanup of orphan Hashed Patterns...`);

	//
	// Setup a stream for all Hashed Pattern IDs that are in use by Rides

	const ridesCollection = await rides.getCollection();
	const hashedPatternIdsInUseStream = ridesCollection.aggregate([{ $group: { _id: '$hashed_pattern_id' } }]).stream();

	//
	// Setup a stream of all Hashed Pattern IDs
	// and collect them in two Sets.

	const hashedPatternsCollection = await hashedPatterns.getCollection();
	const allHashedPatternIdsStream = hashedPatternsCollection.aggregate([{ $group: { _id: '$_id' } }]).stream();

	const hashedPatternIdsInUse = new Set<string>();
	const orphanHashedPatternIds = new Set<string>();

	for await (const item of allHashedPatternIdsStream) {
		orphanHashedPatternIds.add(item._id);
	}

	for await (const item of hashedPatternIdsInUseStream) {
		hashedPatternIdsInUse.add(item._id);
	}

	//
	// Remove all Hashed Pattern IDs that are in use from the Set of orphan Hashed Pattern IDs.
	// This will leave us with only the orphan Hashed Pattern IDs.

	hashedPatternIdsInUse.forEach(hashedPatternIdInUse => orphanHashedPatternIds.delete(hashedPatternIdInUse));

	Logger.info(`Hashed Patterns cleanup progress: In use: ${hashedPatternIdsInUse.size} | Orphan: ${orphanHashedPatternIds.size} (${timer.get()})`);

	//
	// Delete all orphan Hashed Patterns in chunks

	await performInChunks(Array.from(orphanHashedPatternIds), async (chunk) => {
		const result = await hashedPatterns.deleteMany({ _id: { $in: chunk } });
		Logger.info(`Deleted ${result.deletedCount} orphan Hashed Patterns.`);
	});

	Logger.success(`Hashed Patterns cleanup complete. Deleted ${orphanHashedPatternIds.size} orphan Hashed Patterns. (${timer.get()})`);

	//
}
