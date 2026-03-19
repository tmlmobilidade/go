/* * */

import { Logger } from '@tmlmobilidade/logger';
import { type Alert, type GtfsRtEntitySelector } from '@tmlmobilidade/types';

/* * */

export async function transformReferenceTypeAgency(alertData: Alert): Promise<GtfsRtEntitySelector[] | undefined> {
	//

	//
	// Validate required input properties

	if (!alertData.agency_id || !alertData.references?.length) {
		Logger.error(`[Alert ID: ${alertData._id}] Alert references are missing for "agency" reference type.`);
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
	// Return the EntitySelector for the agency

	return [{
		agency_id: alertData.references[0].parent_id,
	}];

	//
}
