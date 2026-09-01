/* * */

import { type GtfsRtTranslatedString } from '@tmlmobilidade/go-types-gtfs-rt';
import { type Alert } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export function transformHeaderText(alertData: Alert): GtfsRtTranslatedString | undefined {
	//

	//
	// Validate required input properties

	if (!alertData.title) {
		Logger.error({ message: `[Alert ID: ${alertData._id}] Alert title is missing.` });
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
