/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';

import { type ControllerRidesDetailRideItem, ControllerRidesDetailRideItemSchema } from './controller-rides-detail-ride-item.js';
import { controllerRidesDetailRideQuery } from './controller-rides-detail-ride-query.js';

/* * */

export async function getControllerRidesDetailRide(rideId: string): Promise<ControllerRidesDetailRideItem> {
	//

	//
	// Build query parameters

	const params: Record<string, number | string> = {
		1: rideId,
	};

	//
	// Execute the query

	const sql = controllerRidesDetailRideQuery;

	const result = await labDb.queryFromString<ControllerRidesDetailRideItem>(sql, params);

	//
	// Return the result

	if (result.length === 0) throw new Error(`Ride not found: ${rideId}`);

	return ControllerRidesDetailRideItemSchema.parse(result[0]);
}
