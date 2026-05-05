/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type Alert, type PublishStatus } from '@tmlmobilidade/types';

/**
 * Determines the publish status of an alert based
 * on its active period and publish period data.
 * @param alertData The alert data object to evaluate.
 * @returns The publish status of the alert.
 */
export function getPublishStatusValue(alertData: Alert): PublishStatus {
	//

	//
	// If the alert is still a draft keep it as draft

	if (alertData.publish_status === 'draft') {
		return 'draft';
	}

	//
	// Check the active period and publish period
	// to determine if the alert should be published

	let result: PublishStatus = 'draft';

	const nowUnixTimestamp = Dates.now('Europe/Lisbon').unix_timestamp;

	if (alertData.publish_start_date && alertData.publish_start_date <= nowUnixTimestamp) {
		// So far the alert is not a draft and the publish start date has passed,
		// so we can consider it published.
		result = 'published';
	}

	if (alertData.publish_end_date && alertData.publish_end_date <= nowUnixTimestamp) {
		// The publish end date has passed, so we can consider the alert archived.
		result = 'archived';
	}

	//
	// If the alert does not match any known publish status,
	// return 'draft' as a fallback.

	return result;
}
