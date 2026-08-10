/* * */

import { Logger } from '@tmlmobilidade/logger';
import { type Alert, AlertCauseToGtfsRtCauseMap, type GtfsRtCause } from '@tmlmobilidade/types';

/* * */

export function transformCause(alertData: Alert): GtfsRtCause {
	//

	//
	// Validate required input properties

	if (!alertData.cause) {
		Logger.error({ message: `[Alert ID: ${alertData._id}] Alert cause is missing.` });
		return 'UNKNOWN_CAUSE';
	}

	//
	// Return the mapped cause

	const mappedCause = AlertCauseToGtfsRtCauseMap[alertData.cause];

	return mappedCause ? mappedCause : 'UNKNOWN_CAUSE';

	//
}
