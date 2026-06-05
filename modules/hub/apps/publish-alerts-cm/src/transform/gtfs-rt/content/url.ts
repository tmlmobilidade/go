/* * */

import { type Alert, type GtfsRtTranslatedString } from '@tmlmobilidade/types';

/* * */

export function transformUrl(alertData: Alert): GtfsRtTranslatedString | undefined {
	//

	//
	// Validate required input properties

	if (!alertData.info_url) return;

	//
	// Return the mapped URL

	return {
		translation: [{
			language: 'pt',
			text: alertData.info_url,
		}],
	};

	//
}
