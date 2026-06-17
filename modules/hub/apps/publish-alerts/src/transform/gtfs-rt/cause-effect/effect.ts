/* * */

import { Logger } from '@tmlmobilidade/logger';
import { type Alert, AlertEffectToGtfsRtEffectMap, type GtfsRtEffect } from '@tmlmobilidade/types';

/* * */

export function transformEffect(alertData: Alert): GtfsRtEffect {
	//

	//
	// Validate required input properties

	if (!alertData.effect) {
		Logger.error({ message: `[Alert ID: ${alertData._id}] Alert effect is missing.` });
		return 'UNKNOWN_EFFECT';
	}

	//
	// Return the mapped effect

	const mappedEffect = AlertEffectToGtfsRtEffectMap[alertData.effect];

	return mappedEffect ? mappedEffect : 'UNKNOWN_EFFECT';

	//
}
