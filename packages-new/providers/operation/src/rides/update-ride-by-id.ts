/* * */

import { type RideAtomicUpdateFields } from '@/types.js';
import { Dates } from '@tmlmobilidade/dates';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type Ride, RideSchema } from '@tmlmobilidade/go-types-operation';

/**
 * Updates a ride by its ID.
 * @param rideId The ID of the Ride to update.
 * @param updateData The data to update the Ride with. Supports partial updates
 * and the `updated_at` timestamp is incremented automatically.
 * @returns A promise resolving to the updated ride.
 * @throws An error if the ride is not found for the given ID.
 */
export async function updateRideById(rideId: string, updateData: RideAtomicUpdateFields): Promise<Ride> {
	// Fetch the ride data from the database to use as a base for the update
	const foundRideBeforeUpdateQuery = await labDb.operation.rides.select('*', '_id = $1 ORDER BY updated_at DESC LIMIT 1', { 1: rideId });
	if (!foundRideBeforeUpdateQuery?.length) throw new Error('Ride not found for ID (when updating ride).');
	// Update the ride data in the database
	const newRideData = RideSchema.parse({
		...foundRideBeforeUpdateQuery[0],
		...updateData,
		updated_at: Dates.now('utc').unix_timestamp,
	});
	// Insert a new version of the ride in the database
	await labDb.operation.rides.insert('JSONEachRow', [newRideData]);
	// Fetch again the latest version of the ride data from the database
	const foundRideAfterUpdateQuery = await labDb.operation.rides.select('*', '_id = $1 ORDER BY updated_at DESC LIMIT 1', { 1: rideId });
	if (!foundRideAfterUpdateQuery?.length) throw new Error('Ride not found for ID (when updating ride).');
	// Return the updated ride
	return foundRideAfterUpdateQuery[0];
}
