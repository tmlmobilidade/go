/* * */

import { stops } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type Alert, type AlertReference } from '@tmlmobilidade/types';
import { getPublicLineId } from '@tmlmobilidade/utils';

/* * */

export async function transformReferenceTypeLinesIntoJson(alertData: Alert): Promise<AlertReference[] | undefined> {
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
	// For each line, add its corresponding
	// agency_id and route_id to the result

	const result: AlertReference[] = [];

	for (const reference of alertData.references) {
		//

		const parsedAlertReference: AlertReference = {
			child_ids: [],
			parent_id: getPublicLineId(alertData.agency_id, reference.parent_id),
		};

		if (!reference.child_ids?.length) {
			result.push(parsedAlertReference);
			continue;
		}

		//
		// If there are child_ids, which in this context
		// represent stop IDs associated with the line,
		// add an AlertReference object for each stop ID.

		for (const childId of reference.child_ids) {
			const foundStopData = await stops.findOne({
				'flags.agency_ids': { $in: [alertData.agency_id] },
				'flags.stop_id': childId,
			});
			if (!foundStopData) {
				Logger.error({ message: `[Alert ID: ${alertData._id}] Stop ID ${childId} not found for agency ID ${alertData.agency_id}.` });
				continue;
			}

			parsedAlertReference.child_ids.push(String(foundStopData._id));

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
