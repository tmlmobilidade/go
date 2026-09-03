/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

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
}
