/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Logger } from '@tmlmobilidade/logger-logger-backend';
import { type Alert, type GtfsRtEntitySelector } from '@tmlmobilidade/types';

/* * */

export async function transformReferenceTypeAgency(alertData: Alert): Promise<GtfsRtEntitySelector[] | undefined> {
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
	// Get the agency data from the database

	const agencyData = await goDb.core.agencies.findOne({
		_id: alertData.references[0].parent_id,
	});

	if (!agencyData) {
		Logger.error({ message: `[Alert ID: ${alertData._id}] Agency data not found for the parent_id of the first reference.` });
		return;
	}

	//
	// Return the EntitySelector for the agency

	return [{
		agency_id: agencyData.code,
	}];

	//
}
