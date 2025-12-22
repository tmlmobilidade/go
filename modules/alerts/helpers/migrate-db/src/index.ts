/* * */

import { alerts } from '@tmlmobilidade/interfaces';
import { type Alert } from '@tmlmobilidade/types';

/* * */

(async function main() {
	//

	console.log('Starting alerts migration...');

	const alertsCollection = await alerts.getCollection();

	const existingAlerts = await alerts.all();

	console.log(`Found ${existingAlerts.length} alerts to migrate.`);

	const migratedAlerts = existingAlerts.map((alert) => {
		const formattedAlert: Alert = {
			...alert,
			publish_status: parsePublishStatus(alert.publish_status),
			reference_type: parseReferenceType(alert.reference_type),
			type: parseAlertType(alert.type),
		};
		console.log(`Alert ${alert._id} migrated.`);
		return formattedAlert;
	});

	console.log('Updating alerts in database...');

	await alertsCollection.updateMany({}, { $set: { ...migratedAlerts } });

	console.log('Alerts migration completed.');

	//
})();

/* * */

function parsePublishStatus(value: string): Alert['publish_status'] {
	if (value === 'PUBLISHED') return 'published';
	if (value === 'ARCHIVED') return 'archived';
	if (value === 'DRAFT') return 'draft';
	return value as Alert['publish_status'];
}

function parseReferenceType(value: string): Alert['reference_type'] {
	if (value === 'LINE') return 'lines';
	if (value === 'STOP') return 'stops';
	if (value === 'TRIP') return 'rides';
	return value as Alert['reference_type'];
}

function parseAlertType(value: string): Alert['type'] {
	if (value === 'PLANNED') return 'scheduled';
	if (value === 'REALTIME') return 'realtime';
	return value as Alert['type'];
}
