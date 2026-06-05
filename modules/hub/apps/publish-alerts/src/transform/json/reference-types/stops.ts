/* * */

import { stops } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type Alert, type AlertReference } from '@tmlmobilidade/types';
import { getPublicLineId } from '@tmlmobilidade/utils';

/* * */

export async function transformReferenceTypeStopsIntoJson(alertData: Alert): Promise<AlertReference[] | undefined> {
	//

	//
	// Validate required input properties

	if (!alertData.agency_id) {
		Logger.error(`[Alert ID: ${alertData._id}] Alert agency_id is missing for "rides" reference type.`);
		return;
	}

	if (!alertData.references?.length) {
		Logger.error(`[Alert ID: ${alertData._id}] Alert references are missing for "rides" reference type or are empty.`);
		return;
	}

	//
	// For each stop, add its corresponding
	// agency_id and stop_id to the result array

	const result: AlertReference[] = [];

	for (const reference of alertData.references) {
		//

		const foundStopData = await stops.findOne({
			'flags.agency_ids': { $in: [alertData.agency_id] },
			'flags.stop_id': reference.parent_id,
		});

		if (!foundStopData) {
			Logger.error(`[Alert ID: ${alertData._id}] Stop ID ${reference.parent_id} not found for agency ID ${alertData.agency_id}.`);
			continue;
		}

		const parsedAlertReference: AlertReference = {
			child_ids: [],
			parent_id: String(foundStopData._id),
		};

		if (!reference.child_ids?.length) {
			result.push(parsedAlertReference);
			continue;
		}

		//
		// If there are child_ids, which in this context
		// represent public line IDs associated with the stop,
		// add an AlertReference object for each line ID.

		for (const childId of reference.child_ids) {
			const publicLineId = getPublicLineId(alertData.agency_id, childId);
			parsedAlertReference.child_ids.push(publicLineId);
			result.push(parsedAlertReference);
		}

		//
	}

	//
	// Return the compiled list
	// of AlertReference objects

	return result;

	//
}
