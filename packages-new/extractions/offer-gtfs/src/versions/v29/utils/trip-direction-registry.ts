/* * */

import { TripDirectionReference, TripDirectionResolver } from '../types.js';

/* * */

/** Keeps the first exported trip as the direction reference for each route. */
export function createTripDirectionResolver(): TripDirectionResolver {
	//

	//
	// A. Setup variables

	const references = new Map<string, TripDirectionReference>();

	//
	// B. Return direction ID

	return (trip) => {
		const reference = references.get(trip.route_id);

		if (!reference) {
			references.set(trip.route_id, { ...trip });
			return '0';
		}

		return trip.trip_headsign !== reference.trip_headsign && trip.shape_id !== reference.shape_id ? '1' : '0';
	};
}
