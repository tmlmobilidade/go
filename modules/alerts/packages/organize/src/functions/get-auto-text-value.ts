/* * */

import { type Alert } from '@tmlmobilidade/types';

/**
 * Sets the `auto_texts` attribute of an alert
 * if it is not already set.
 * @param alertData The alert data object to evaluate.
 * @returns The `auto_texts` attribute of the alert.
 */
export function getAutoTextValue(alertData: Alert): Alert['auto_texts'] {
	if (alertData.auto_texts !== true && alertData.auto_texts !== false) {
		return false;
	}
}
