/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

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
export async function cleanupOrphanHashedTrips() {
	//

	const timer = new Timer();

	Logger.spacer(1);
	Logger.info({ message: `Starting cleanup of orphan Hashed Trips...` });

	await labDb.operation.hashedTrips.delete('_id NOT IN (SELECT DISTINCT hashed_trip_id FROM operation.rides)');

	Logger.success(`Hashed Trips cleanup complete. Deleted orphan Hashed Trips. (${timer.get()})`);

	//
}

/**
 * Delete all HashedShapes that are not referenced by any Ride.
 */
export async function cleanupOrphanHashedShapes() {
	//

	const timer = new Timer();

	Logger.spacer(1);
	Logger.info({ message: `Starting cleanup of orphan Hashed Shapes...` });

	await labDb.operation.hashedShapes.delete('_id NOT IN (SELECT DISTINCT hashed_shape_id FROM operation.rides)');

	Logger.success(`Hashed Shapes cleanup complete. Deleted orphan Hashed Shapes. (${timer.get()})`);

	//
}
