/* * */

import { alerts } from '@tmlmobilidade/interfaces';
import { type Alert, AlertSchema } from '@tmlmobilidade/types';

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
			created_by: 'system',
			publish_status: parsePublishStatus(alert.publish_status),
			reference_type: parseReferenceType(alert.reference_type),
			type: parseAlertType(alert.type),
			updated_by: 'system',
		};
		formattedAlert.agency_ids = parseAlertAgencyIds(formattedAlert.reference_type, alert.references);
		if (alert.reference_type === 'AGENCY') formattedAlert.references = [];
		const result = AlertSchema.parse(formattedAlert);
		return result;
	});

	console.log('Updating alerts in database...');

	const updateInstructions = migratedAlerts.map((alert) => {
		return {
			updateOne: {
				filter: { _id: alert._id },
				update: { $set: alert, $unset: { modified_by: 1 } },
			},
		};
	});

	await alertsCollection.bulkWrite(updateInstructions);

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
	if (value === 'AGENCY') return 'lines';
	return value as Alert['reference_type'];
}

function parseAlertType(value: string): Alert['type'] {
	if (value === 'PLANNED') return 'scheduled';
	if (value === 'REALTIME') return 'realtime';
	return value as Alert['type'];
}

function parseAlertAgencyIds(referenceType: Alert['reference_type'], references: Alert['references']): Alert['agency_ids'] {
	const agencyIdsSet = new Set<string>();
	references.forEach((reference) => {
		if (referenceType === 'lines') {
			if (reference.parent_id.length === 4) {
				agencyIdsSet.add(`4${reference.parent_id.substring(0, 1)}`);
			}
		}
	});
	if (agencyIdsSet.size === 0) {
		agencyIdsSet.add('41');
		agencyIdsSet.add('42');
		agencyIdsSet.add('43');
		agencyIdsSet.add('44');
	}
	return Array.from(agencyIdsSet);
}
