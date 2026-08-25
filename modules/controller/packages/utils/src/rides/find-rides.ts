/* * */

import { type RideFilterFields, type RideFilterKey } from '@/rides/types.js';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type Ride } from '@tmlmobilidade/go-types-operation';

/**
 * Finds rides by filtering fields. This helper function selects the Rides with the
 * most recent `updated_at` timestamp for each Ride, dealing with possible momentary duplicates.
 * @param fields The fields to filter the Rides by.
 * @returns A promise resolving to the rides.
 * @throws An error if the rides are not found for the given fields.
 */
export async function findRides<K extends RideFilterKey>(fields: RideFilterFields<K>): Promise<Ride[]> {
	//

	//
	// Build the params object that will be used in the query

	const params: Record<string, number | string> = {};

	//
	// Initialize the param index

	let paramIndex = 1;

	//
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

	//
	// Fetch the rides data from the database in a single query

	const selectResult = await labDb.operation.rides.queryFromString(
		`
			SELECT *
			FROM operation.rides FINAL
			WHERE ${where}
		`,
		params,
	);

	//
	// Throw an error if no rides are found

	if (!selectResult?.length) throw new Error(`Rides not found using the following fields: ${JSON.stringify(fields)} and the following params: ${JSON.stringify(params)}`);

	//
	// Return the rides found

	return selectResult;
}
