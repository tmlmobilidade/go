/* * */

import { Dates } from '@tmlmobilidade/dates';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type HashedTrip, type Ride, RideSchema } from '@tmlmobilidade/go-types-operation';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

class RidesProviderClass {
	//

	private static _instance: RidesProviderClass;

	public static async getInstance() {
		if (!RidesProviderClass._instance) {
			RidesProviderClass._instance = new RidesProviderClass();
		}
		return RidesProviderClass._instance;
	}

	/**
	 * Finds a ride by its ID. This helper function selects the Ride with the
	 * most recent `updated_at` timestamp, dealing with possible momentary duplicates.
	 * @param rideId The ID of the Ride to find.
	 * @returns A promise resolving to the ride.
	 * @throws An error if the ride is not found for the given ID.
	 */
	async findRideById(rideId: string): Promise<Ride> {
		// Fetch the ride data from the database
		const selectResult = await labDb.operation.rides.select('*', '_id = $1 ORDER BY updated_at DESC LIMIT 1', { 1: rideId });
		// Throw an error if no ride is found
		if (!selectResult?.length) throw new Error('Ride not found for ID.');
		// Return the first ride found
		return selectResult[0];
	}

	/**
	 * Finds a HashedTrip by its ID. This helper function selects the HashedTrip with the
	 * most recent `updated_at` timestamp, dealing with possible momentary duplicates.
	 * @param hashedTripId The ID of the HashedTrip to find.
	 * @returns A promise resolving to the hashed trip.
	 * @throws An error if the hashed trip is not found for the given ID.
	 */
	async findHashedTripById(hashedTripId: string): Promise<HashedTrip> {
		// Fetch the hashed trip data from the database
		const selectResult = await labDb.operation.hashedTrips.select('*', '_id = $1 ORDER BY updated_at DESC LIMIT 1', { 1: hashedTripId });
		// Throw an error if no hashed trip is found
		if (!selectResult?.length) throw new Error('HashedTrip not found for ID.');
		// Return the first hashed trip found
		return selectResult[0];
	}

	/**
	 * Finds a HashedTrip by its ID. This helper function selects the HashedTrip with the
	 * most recent `updated_at` timestamp, dealing with possible momentary duplicates.
	 * @param hashedTripId The ID of the HashedTrip to find.
	 * @returns A promise resolving to the hashed trip.
	 * @throws An error if the hashed trip is not found for the given ride ID.
	 */
	async findHashedTripByRideId(rideId: string): Promise<HashedTrip> {
		// Fetch the hashed trip ID from the ride data from the database
		const selectHashedTripIdResult = await labDb.operation.rides.select('hashed_trip_id', '_id = $1 ORDER BY updated_at DESC LIMIT 1', { 1: rideId });
		if (!selectHashedTripIdResult?.length) throw new Error('Ride not found for ride ID (when searching for hashed trip ID).');
		// Fetch the hashed trip data from the database
		const selectHashedTripResult = await labDb.operation.hashedTrips.select('*', '_id = $1 ORDER BY updated_at DESC LIMIT 1', { 1: selectHashedTripIdResult[0].hashed_trip_id });
		if (!selectHashedTripResult?.length) throw new Error('HashedTrip not found for ride ID (when searching for hashed trip ID)');
		// Return the first hashed trip found
		return selectHashedTripResult[0];
	}

	/**
	 * Updates a ride by its ID.
	 * @param rideId The ID of the Ride to update.
	 * @param updateData The data to update the Ride with. Supports partial updates.
	 * @returns A promise resolving to the updated ride.
	 * @throws An error if the ride is not found for the given ID.
	 */
	async updateRideById(rideId: string, updateData: Partial<Ride>): Promise<Ride> {
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
}

/* * */

export const ridesProvider = asyncSingletonProxy(RidesProviderClass);
