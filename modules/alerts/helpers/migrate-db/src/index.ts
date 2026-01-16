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
			auto_texts: false,
			created_by: 'system',
			publish_status: parsePublishStatus(alert.publish_status),
			reference_type: parseReferenceType(alert.reference_type),
			updated_by: 'system',
		};
		formattedAlert.agency_id = parseAlertAgencyId(alert.title, alert.references);
		if (alert.reference_type === 'AGENCY' as Alert['reference_type']) formattedAlert.references = [];
		if (formattedAlert.cause === 'UNKNOWN_CAUSE' as Alert['cause']) formattedAlert.cause = 'TECHNICAL_PROBLEM';
		if (formattedAlert.cause === 'OTHER_CAUSE' as Alert['cause']) formattedAlert.cause = 'TECHNICAL_PROBLEM';
		if (formattedAlert.effect === 'UNKNOWN_EFFECT' as Alert['effect']) formattedAlert.effect = 'MODIFIED_SERVICE';
		if (formattedAlert.effect === 'OTHER_EFFECT' as Alert['effect']) formattedAlert.effect = 'MODIFIED_SERVICE';
		if (formattedAlert.effect === 'NO_EFFECT' as Alert['effect']) formattedAlert.effect = 'MODIFIED_SERVICE';
		const result = AlertSchema.parse(formattedAlert);
		return result;
	});

	console.log('Updating alerts in database...');

	const updateInstructions = migratedAlerts.map((alert) => {
		return {
			updateOne: {
				filter: { _id: alert._id },
				update: { $set: alert, $unset: { modified_by: 1, type: 1 } },
			},
		};
	});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	await alertsCollection.bulkWrite(updateInstructions as any[]);

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

function parseAlertAgencyId(title: Alert['title'], references: Alert['references']): Alert['agency_id'] {
	// Detect 4 digit number anywhere in title
	const digitMatch = title.match(/\b\d{4}\b/);
	if (digitMatch) {
		const agencyId = `4${digitMatch[0].substring(0, 1)}`;
		// console.log('Parsed agency ID:', agencyId, 'from title:', title);
		return agencyId;
	}
	const detectedAgencies = new Set<string>();
	references.forEach((reference) => {
		const number = reference.parent_id.substring(0, 4);
		const agencyId = Number(`4${number.substring(0, 1)}`);
		if (!isNaN(agencyId)) detectedAgencies.add(String(agencyId));
	});
	if (detectedAgencies.size >= 1) return Array.from(detectedAgencies)[0];
	console.log('Could not parse agency ID from title:', title, references);
	return '1';
}
