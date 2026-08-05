/* * */

import { Dates } from '@tmlmobilidade/dates';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type Ride, RideSchema } from '@tmlmobilidade/go-types-operation';
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
	 * @returns A promise resolving to the ride if found, otherwise null.
	 */
	async findRideById(rideId: string): Promise<null | Ride> {
		// Fetch the ride data from the database
		const selectResult = await labDb.operation.rides.select('*', '_id = $1 ORDER BY updated_at DESC LIMIT 1', { 1: rideId });
		// Return null if no ride is found
		if (!selectResult?.length) return null;
		// Return the first ride found
		return selectResult[0];
	}

	/**
	 * Updates a ride by its ID.
	 * @param rideId The ID of the Ride to update.
	 * @param updateData The data to update the Ride with. Supports partial updates.
	 * @returns A promise resolving to the updated ride if found, otherwise null.
	 */
	async updateRideById(rideId: string, updateData: Partial<Ride>): Promise<null | Ride> {
		// Fetch the ride data from the database to use as a base for the update
		const foundRideBeforeUpdateQuery = await labDb.operation.rides.select('*', '_id = $1 ORDER BY updated_at DESC LIMIT 1', { 1: rideId });
		if (!foundRideBeforeUpdateQuery?.length) return null;
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
		if (!foundRideAfterUpdateQuery?.length) return null;
		// Return the updated ride
		return foundRideAfterUpdateQuery[0];
	}
}

/* * */

export const ridesProvider = asyncSingletonProxy(RidesProviderClass);
