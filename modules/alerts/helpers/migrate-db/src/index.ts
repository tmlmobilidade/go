/* * */

import { alerts } from '@tmlmobilidade/interfaces';
import { type Alert, AlertSchema } from '@tmlmobilidade/types';

import { municipalitiesMap } from './municipalities-map.js';

/* * */

// Adicionar mapa de municipios por agencia
// Detetar agencias em cada alerta
//    - Se reference type = lines, usar as linhas
//    - Se reference type != lines, usar os municipios
// De 1 alerta, fazer vários se tiver mais do que 1 agencia

/* * */

(async function main() {
	//

	console.log('Starting alerts migration...');

	const alertsCollection = await alerts.getCollection();

	const existingAlerts = await alerts.all();

	console.log(`Found ${existingAlerts.length} alerts to migrate.`);

	//
	// Iterate over existing alerts and format them

	const migratedAlerts: Alert[] = [];

	for (const originalAlert of existingAlerts) {
		// Detect agencies and create separate alerts if needed
		const detectedAgencies = new Set<string>();
		originalAlert.references.forEach((reference) => {
			const agencyId = Number(`4${reference.parent_id.substring(0, 1)}`);
			if (!isNaN(agencyId)) detectedAgencies.add(String(agencyId));
		});
		originalAlert.municipality_ids.forEach((municipalityId) => {
			const agencyIds = municipalitiesMap[municipalityId];
			if (agencyIds.length > 0) agencyIds.forEach(agencyId => detectedAgencies.add(agencyId));
		});
		if (detectedAgencies.size === 0) {
			console.log('Could not parse agency ID for Alert ID:', originalAlert._id);
		}
		for (const agencyId of detectedAgencies) {
			const formattedAlert: Alert = {
				...originalAlert,
				agency_id: agencyId,
				auto_texts: false,
				created_by: 'system',
				publish_status: parsePublishStatus(originalAlert.publish_status),
				reference_type: parseReferenceType(originalAlert.reference_type),
				updated_by: 'system',
			};
			if (originalAlert.reference_type === 'AGENCY' as Alert['reference_type']) formattedAlert.references = [];
			if (formattedAlert.cause === 'UNKNOWN_CAUSE' as Alert['cause']) formattedAlert.cause = 'TECHNICAL_ISSUE';
			if (formattedAlert.cause === 'OTHER_CAUSE' as Alert['cause']) formattedAlert.cause = 'TECHNICAL_ISSUE';
			if (formattedAlert.effect === 'UNKNOWN_EFFECT' as Alert['effect']) formattedAlert.effect = 'NO_SERVICE';
			if (formattedAlert.effect === 'OTHER_EFFECT' as Alert['effect']) formattedAlert.effect = 'NO_SERVICE';
			if (formattedAlert.effect === 'NO_EFFECT' as Alert['effect']) formattedAlert.effect = 'NO_SERVICE';
			const result = AlertSchema.safeParse(formattedAlert);
			if (!result.success) {
				console.error('Validation failed for Alert ID:', originalAlert._id, 'Errors:', result.error.errors);
				continue;
			}
			migratedAlerts.push(result.data);
		}
	}

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
	if (value === 'AGENCY') return 'agency';
	return value as Alert['reference_type'];
}
