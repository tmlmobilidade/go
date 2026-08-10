/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type Ride } from '@tmlmobilidade/go-types-operation';

/**
 * Finds a ride by its ID. This helper function selects the Ride with the
 * most recent `updated_at` timestamp, dealing with possible momentary duplicates.
 * @param rideId The ID of the Ride to find.
 * @returns A promise resolving to the ride.
 * @throws An error if the ride is not found for the given ID.
 */
export async function findRideById(rideId: string): Promise<Ride> {
	//

	//
	// Fetch the ride data from the database

	const selectResult = await labDb.operation.rides.queryFromString(
		`SELECT * FROM operation.rides FINAL WHERE _id = $1`,
		{ 1: rideId },
	);

	//
	// Throw an error if no ride is found

	if (!selectResult?.length) throw new Error('Ride not found for ID.');

	//
	// Return the first ride found

	return selectResult[0];
}
