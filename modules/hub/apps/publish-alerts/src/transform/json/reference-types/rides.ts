/* * */

import { rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type Alert, type AlertReference } from '@tmlmobilidade/types';
import { getPublicTripId } from '@tmlmobilidade/utils';

/* * */

export async function transformReferenceTypeRidesIntoJson(alertData: Alert): Promise<AlertReference[] | undefined> {
	//

	//
	// Validate required input properties

	if (!alertData.agency_id) {
		Logger.error({ message: `[Alert ID: ${alertData._id}] Alert agency_id is missing for "rides" reference type.` });
		return;
	}

	if (!alertData.references?.length) {
		Logger.error({ message: `[Alert ID: ${alertData._id}] Alert references are missing for "rides" reference type or are empty.` });
		return;
	}

	//
	// For each ride, add its corresponding
	// agency_id and trip_id to the resul	t

	const result: AlertReference[] = [];

	for (const reference of alertData.references) {
		//

		//
		// Find the ride document by its ID
		// and prepare the AlertReference object

		const foundRide = await rides.findById(reference.parent_id);

		if (!foundRide) {
			Logger.error({ message: `[Alert ID: ${alertData._id}] No ride found for ride ID ${reference.parent_id}.` });
			continue;
		}

		const parsedAlertReference: AlertReference = {
			child_ids: [],
			parent_id: getPublicTripId(foundRide.plan_id, alertData.agency_id, foundRide.trip_id),
		};

		result.push(parsedAlertReference);

		//
	}

	//
	// Return the compiled list
	// of AlertReference objects

	return result;

	//
}
