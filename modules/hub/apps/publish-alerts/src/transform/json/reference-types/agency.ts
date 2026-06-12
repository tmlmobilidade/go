/* * */

import { Logger } from '@tmlmobilidade/logger';
import { type Alert, AlertReference } from '@tmlmobilidade/types';

/* * */

export async function transformReferenceTypeAgencyIntoJson(alertData: Alert): Promise<AlertReference[] | undefined> {
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

	if (alertData.references.length > 1) {
		Logger.error(`[Alert ID: ${alertData._id}] Alert references exceed 1 for "agency" reference type.`);
		return;
	}

	if (alertData.agency_id && alertData.agency_id !== alertData.references[0].parent_id) {
		Logger.error(`[Alert ID: ${alertData._id}] Alert agency_id does not match the parent_id of the first reference.`);
		return;
	}

	//
	// Return the AlertReference object for the agency

	return [{
		child_ids: [],
		parent_id: alertData.references[0].parent_id,
	}];

	//
}
