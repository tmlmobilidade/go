/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type HashedTrip } from '@tmlmobilidade/go-types-operation';

/**
 * Finds a HashedTrip by its ID. This helper function selects the HashedTrip with the
 * most recent `updated_at` timestamp, dealing with possible momentary duplicates.
 * @param hashedTripId The ID of the HashedTrip to find.
 * @returns A promise resolving to the hashed trip.
 * @throws An error if the hashed trip is not found for the given ride ID.
 */
export async function findHashedTripByRideId(rideId: string): Promise<HashedTrip> {
	// Fetch the hashed trip ID from the ride data from the database
	const selectHashedTripIdResult = await labDb.operation.rides.select('hashed_trip_id', '_id = $1 ORDER BY updated_at DESC LIMIT 1', { 1: rideId });
	if (!selectHashedTripIdResult?.length) throw new Error('Ride not found for ride ID (when searching for hashed trip ID).');
	// Fetch the hashed trip data from the database
	const selectHashedTripResult = await labDb.operation.hashedTrips.select('*', '_id = $1 ORDER BY updated_at DESC LIMIT 1', { 1: selectHashedTripIdResult[0].hashed_trip_id });
	if (!selectHashedTripResult?.length) throw new Error('HashedTrip not found for ride ID (when searching for hashed trip ID)');
	// Return the first hashed trip found
	return selectHashedTripResult[0];
}
