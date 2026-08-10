/* * */

import { type RideAtomicUpdateFields, type RideFilterFields, type RideFilterKey } from '@/types.js';
import { Dates } from '@tmlmobilidade/dates';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type HashedTrip, type Ride, RideSchema } from '@tmlmobilidade/go-types-operation';

/* * */

class RidesProviderClass {
	//

	/**
	 * Finds a ride by its ID. This helper function selects the Ride with the
	 * most recent `updated_at` timestamp, dealing with possible momentary duplicates.
	 * @param rideId The ID of the Ride to find.
	 * @returns A promise resolving to the ride.
	 * @throws An error if the ride is not found for the given ID.
	 */
	async findRideById(rideId: string): Promise<Ride> {
		// Fetch the ride data from the database
		const selectResult = await labDb.operation.rides.queryFromString(
			`SELECT * FROM operation.rides FINAL WHERE _id = $1`,
			{ 1: rideId },
		);
		// Throw an error if no ride is found
		if (!selectResult?.length) throw new Error('Ride not found for ID.');
		// Return the first ride found
		return selectResult[0];
	}

	/**
	 * Finds rides by their IDs. This helper function selects the Rides with the
	 * most recent `updated_at` timestamp for each Ride, dealing with possible momentary duplicates.
	 * @param rideIds The IDs of the Rides to find.
	 * @returns A promise resolving to the rides.
	 * @throws An error if the rides are not found for the given IDs.
	 */
	async findRidesById(rideIds: string[]): Promise<Ride[]> {
		// Return the rides found
		return this.findRides({ _id: rideIds });
	}

	/**
	 * Finds rides by filtering fields. This helper function selects the Rides with the
	 * most recent `updated_at` timestamp for each Ride, dealing with possible momentary duplicates.
	 * @param fields The fields to filter the Rides by.
	 * @returns A promise resolving to the rides.
	 * @throws An error if the rides are not found for the given fields.
	 */
	async findRides<K extends RideFilterKey>(fields: RideFilterFields<K>): Promise<Ride[]> {
		// Build the params object that will be used in the query
		const params: Record<string, number | string> = {};
		// Initialize the param index
		let paramIndex = 1;
		// Build the where clause from the fields params
		const where = (Object.keys(fields) as K[])
			.map((key) => {
				// If the field is an array, build the IN clause
				if (Array.isArray(fields[key])) {
					const placeholders = fields[key].map((v) => {
						const index = paramIndex++;
						params[String(index)] = v;
						return `$${index}`;
					});
					return `${String(key)} IN (${placeholders.join(', ')})`;
				}
				// If the field is not an array, build the = clause
				const index = paramIndex++;
				params[String(index)] = fields[key];
				return `${String(key)} = $${index}`;
			})
			.join(' AND ');
		// Fetch the rides data from the database in a single query
		const selectResult = await labDb.operation.rides.queryFromString(
			`
				SELECT *
				FROM operation.rides FINAL
				WHERE ${where}
			`,
			params,
		);
		// Throw an error if no rides are found
		if (!selectResult?.length) throw new Error(`Rides not found using the following fields: ${JSON.stringify(fields)} and the following params: ${JSON.stringify(params)}`);
		// Return the rides found
		return selectResult;
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
	 * Updates rides matching the given filter by inserting new versions with the
	 * specified updated fields. This function is atomic, meaning that if any of the
	 * @param filter The fields used to select rides to update.
	 * @param updatedFields The fields to overwrite on each selected ride.
	 * @returns The number of new ride versions inserted.
	 * @throws If no rides are found for the given filter.
	 */
	async updateRides<K extends RideFilterKey>(filter: RideFilterFields<K>, updatedFields: RideAtomicUpdateFields): Promise<number> {
		// Return 0 if there are no updates to apply
		if (Object.keys(updatedFields).length === 0) return 0;
		// Fetch the latest versions of the matching rides
		const foundRides = await this.findRides<K>(filter);
		if (!foundRides?.length) throw new Error(`Rides not found using the following fields: ${JSON.stringify(filter)}`);
		// Create the new ride versions with the new
		// updated fields and the new updated_at timestamp
		const newRides = foundRides.map(foundRide => ({
			...foundRide,
			...updatedFields,
			updated_at: Dates.now('utc').unix_timestamp,
		}));
		// Insert the new ride versions in the database
		await labDb.operation.rides.insert('JSONEachRow', newRides);
		// Return the number of new ride versions inserted
		return newRides.length;
	}

	/**
	 * Updates a ride by its ID.
	 * @param rideId The ID of the Ride to update.
	 * @param updateData The data to update the Ride with. Supports partial updates
	 * and the `updated_at` timestamp is incremented automatically.
	 * @returns A promise resolving to the updated ride.
	 * @throws An error if the ride is not found for the given ID.
	 */
	async updateRideById(rideId: string, updateData: RideAtomicUpdateFields): Promise<Ride> {
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

export const ridesProvider = new RidesProviderClass();
