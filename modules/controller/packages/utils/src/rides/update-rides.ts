/* * */

import { type RideAtomicUpdateFields, type RideFilterFields, type RideFilterKey } from '@/rides/types.js';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { Dates } from '@tmlmobilidade/go-utils-dates';

import { findRides } from './find-rides.js';

/**
 * Updates rides matching the given filter by inserting new versions with the
 * specified updated fields. This function is atomic, meaning that if any of the
 * @param filter The fields used to select rides to update.
 * @param updatedFields The fields to overwrite on each selected ride.
 * @returns The number of new ride versions inserted.
 * @throws If no rides are found for the given filter.
 */
export async function updateRides<K extends RideFilterKey>(filter: RideFilterFields<K>, updatedFields: RideAtomicUpdateFields): Promise<number> {
	// Return 0 if there are no updates to apply
	if (Object.keys(updatedFields).length === 0) return 0;
	// Fetch the latest versions of the matching rides
	const foundRides = await findRides<K>(filter);
	if (!foundRides?.length) throw new Error(`Rides not found using the following fields: ${JSON.stringify(filter)}`);
	// Create the new ride versions with the new
	// updated fields and the new updated_at timestamp
	const newRides = foundRides.map(foundRide => ({
		...foundRide,
		...updatedFields,
		updated_at: Dates.now('utc').unix_milliseconds,
	}));
	// Insert the new ride versions in the database
	await labDb.operation.rides.insert('JSONEachRow', newRides);
	// Return the number of new ride versions inserted
	return newRides.length;
}
