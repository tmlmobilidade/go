/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type HashedTrip } from '@tmlmobilidade/go-types-operation';

/**
 * Finds a HashedTrip by its ID. This helper function selects the HashedTrip with the
 * most recent `updated_at` timestamp, dealing with possible momentary duplicates.
 * @param hashedTripId The ID of the HashedTrip to find.
 * @returns A promise resolving to the hashed trip.
 * @throws An error if the hashed trip is not found for the given ID.
 */
export async function findHashedTripById(hashedTripId: string): Promise<HashedTrip> {
	// Fetch the hashed trip data from the database
	const selectResult = await labDb.operation.hashedTrips.select('*', '_id = $1 ORDER BY updated_at DESC LIMIT 1', { 1: hashedTripId });
	// Throw an error if no hashed trip is found
	if (!selectResult?.length) throw new Error('HashedTrip not found for ID.');
	// Return the first hashed trip found
	return selectResult[0];
}
