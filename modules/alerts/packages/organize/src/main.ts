/* * */

import { getPublishStatus } from '@/functions/get-publish-status.js';
import { type Alert } from '@tmlmobilidade/types';

/**
 * Organizes an alert by applying various organization functions.
 * @param alertData The alert data object to organize.
 * @returns The organized alert data object.
 */
export async function organizeAlert(alertData: Alert): Promise<Alert> {
	//

	const updatedAlertData = { ...alertData };

	//
	// Get the publish status of the alert

	updatedAlertData.publish_status = getPublishStatus(alertData);

	//
	// Return the organized alert data

	return updatedAlertData;

	//
}
