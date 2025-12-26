/* * */

import { hashedTrips, rides } from '@tmlmobilidade/interfaces';
import { type HashedTrip, type Ride } from '@tmlmobilidade/types';

/* * */

export interface GetDataForRidesReferenceTypeReturnType {
	hashed_trip: HashedTrip
	ride: Ride
}

/* * */

export async function getDataForRidesReferenceType(rideIds: string[]): Promise<GetDataForRidesReferenceTypeReturnType[]> {
	//

	//
	// Fetch the rides from the database

	const foundRides = await rides.findMany({ _id: { $in: rideIds } });

	//
	// For each ride, get the hashed trip data

	const results: { hashed_trip: HashedTrip, ride: Ride }[] = [];

	for (const ride of foundRides) {
		const hashedTrip = await hashedTrips.findById(ride.hashed_trip_id);
		if (hashedTrip) results.push({ hashed_trip: hashedTrip, ride });
	}

	return results;

	//
}
