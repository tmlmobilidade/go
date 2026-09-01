/* * */

import { type GtfsRtTranslatedString } from '@tmlmobilidade/go-types-gtfs-rt';
import { type Alert } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export function transformDescriptionText(alertData: Alert): GtfsRtTranslatedString | undefined {
	//

	//
	// Validate required input properties

	if (!alertData.description) {
		Logger.error({ message: `[Alert ID: ${alertData._id}] Alert description is missing.` });
		return undefined;
	}

	//
	// Return the mapped description text

	return {
		translation: [{
			language: 'pt',
			text: alertData.description,
		}],
	};

	//
}
