/* * */

import { alerts } from '@tmlmobilidade/interfaces';
import { type Alert } from '@tmlmobilidade/types';

/* * */

(async function main() {
	//

	//
	// Delete existing alerts

	const existingAlerts = await alerts.all();

	for (const alert of existingAlerts) {
		const formattedAlert: Alert = {
			...alert,
			publish_status: parsePublishStatus(alert.publish_status),
			reference_type: parseReferenceType(alert.reference_type),
			type: parseAlertType(alert.type),
		};
		await alerts.updateById(alert._id, formattedAlert);
	}

	//
})();

/* * */

function parsePublishStatus(value: string): Alert['publish_status'] {
	if (value === 'PUBLISHED') return 'published';
	if (value === 'ARCHIVED') return 'archived';
	return 'draft';
}

function parseReferenceType(value: string): Alert['reference_type'] {
	if (value === 'LINE') return 'lines';
	if (value === 'STOP') return 'stops';
	if (value === 'TRIP') return 'rides';
	return 'lines';
}

function parseAlertType(value: string): Alert['type'] {
	if (value === 'PLANNED') return 'scheduled';
	return 'realtime';
}
