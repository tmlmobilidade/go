/* * */

import { type GtfsRtEntitySelector } from '@tmlmobilidade/go-types-gtfs-rt';
import { type Alert } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export async function transformReferenceTypeAgencyIntoGtfsRt(alertData: Alert): Promise<GtfsRtEntitySelector[] | undefined> {
	//

	//
	// Validate required input properties

	if (!alertData.agency_id || !alertData.references?.length) {
		Logger.error({ message: `[Alert ID: ${alertData._id}] Alert references are missing for "agency" reference type.` });
		return;
	}

	if (alertData.references.length > 1) {
		Logger.error({ message: `[Alert ID: ${alertData._id}] Alert references exceed 1 for "agency" reference type.` });
		return;
	}

	if (alertData.agency_id && alertData.agency_id !== alertData.references[0].parent_id) {
		Logger.error({ message: `[Alert ID: ${alertData._id}] Alert agency_id does not match the parent_id of the first reference.` });
		return;
	}

	//
	// Return the EntitySelector for the agency

	return [{
		agency_id: alertData.references[0].parent_id,
	}];

	//
}
