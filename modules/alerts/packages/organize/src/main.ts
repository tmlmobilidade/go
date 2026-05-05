/* * */

import { getAutoTextValue } from '@/functions/get-auto-text-value.js';
import { getPublishStatusValue } from '@/functions/get-publish-status-value.js';
import { type Alert, AlertSchema } from '@tmlmobilidade/types';

/**
 * Organizes an alert by applying various organization functions.
 * @param alertData The alert data object to organize.
 * @returns The organized alert data object.
 */
export async function organizeAlert(alertData: Alert): Promise<Alert> {
	//

	const updatedAlertData = { ...alertData };

	//
	// Get updated properties

	updatedAlertData.publish_status = getPublishStatusValue(alertData);

	updatedAlertData.auto_texts = getAutoTextValue(alertData);

	//
	// Attempt to parse the updated alert with Zod
	// to ensure it adheres to the Alert schema.

	const parseResult = AlertSchema.safeParse(updatedAlertData);

	if (!parseResult.success) {
		throw new Error(`Validation failed for updated alert data: ${parseResult.error.message}`);
	}

	//
	// Return the organized alert data

	return updatedAlertData;

	//
}
