/* * */

import { rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type Alert } from '@tmlmobilidade/types';
import { type EntitySelector } from 'gtfs-types';

/* * */

export async function transformReferenceTypeRides(alertData: Alert): Promise<EntitySelector[] | undefined> {
	//

	//
	// Validate required input properties

	if (!alertData.agency_id || !alertData.references?.length) {
		Logger.error(`[Alert ID: ${alertData._id}] Alert references are missing for "rides" reference type.`);
		return;
	}

	if (!alertData.active_period_start_date) {
		Logger.error(`[Alert ID: ${alertData._id}] Alert active_period_start_date is missing.`);
		return;
	}

	if (!alertData.active_period_end_date) {
		Logger.error(`[Alert ID: ${alertData._id}] Alert active_period_end_date is missing.`);
		return;
	}

	//
	// For each ride, add its corresponding
	// agency_id and route_id to the result

	const result: EntitySelector[] = [];

	for (const reference of alertData.references) {
		//

		//
		// Find distinct values of route_id
		// for rides matching the ride ID,
		// the agency ID, and the alert start time.

		const foundRide = await rides.findById(reference.parent_id);

		if (!foundRide) {
			Logger.error(`[Alert ID: ${alertData._id}] No ride found for ride ID ${reference.parent_id}.`);
			continue;
		}

		const parsedEntitySelector: EntitySelector = {
			agency_id: alertData.agency_id,
			trip: {
				route_id: foundRide.route_id,
				trip_id: foundRide.trip_id,
			},
		};

		result.push(parsedEntitySelector);

		//
	}

	//
	// Return the compiled list
	// of EntitySelector objects

	return result;

	//
}
