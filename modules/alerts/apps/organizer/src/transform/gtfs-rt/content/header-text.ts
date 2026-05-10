/* * */

import { Logger } from '@tmlmobilidade/logger';
import { type Alert, type GtfsRtTranslatedString } from '@tmlmobilidade/types';

/* * */

export function transformHeaderText(alertData: Alert): GtfsRtTranslatedString | undefined {
	//

	//
	// Validate required input properties

	if (!alertData.title) {
		Logger.error(`[Alert ID: ${alertData._id}] Alert title is missing.`);
		return undefined;
	}

	//
	// Return the mapped header text

	return {
		translation: [{
			language: 'pt',
			text: alertData.title,
		}],
	};

	//
}
