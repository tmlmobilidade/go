/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { exportOrganizationGtfs } from './tasks/export-organization.js';
import { getActivePlans } from './utils/get-active-plans.js';

/* * */

async function main() {
	//

	Logger.init();

	const globalTimer = new Timer();
	const organizationsCollection = await goDb.core.organizations.getCollection();

	// Update GTFS Status of Organizations that do not have GTFS Processing enabled
	await organizationsCollection.updateMany({ 'open_data.gtfs.enabled': { $ne: true }, 'open_data.gtfs.status': { $ne: 'skipped' } }, {
		$set: { 'open_data.gtfs.status': 'skipped' },
	});

	//
	// For each enabled organization, publish a feed containing its agencies.

	const organizations = await goDb.core.organizations.findMany({ 'open_data.gtfs.enabled': true }, { projection: { _id: 1, agency_ids: 1, long_name: 1, open_data: 1 } });
	for (const organization of organizations) {
		try {
			Logger.title(`Publishing GTFS feed for organization ${organization.long_name} (${organization._id}).`);

			//
			// Retrieve active plans for the organization
			const activePlans = await getActivePlans(organization.agency_ids);
			const planHashes = activePlans.map(plan => plan.hash).sort();
			const previousPlanHashes = [...(organization.open_data.gtfs.plan_hashes ?? [])].sort();

			// Only reuse a successfully published feed with the same complete list of hashes.
			const plansUnchanged = planHashes.length === previousPlanHashes.length && planHashes.every((hash, index) => hash === previousPlanHashes[index]);
			if (organization.open_data.gtfs.status === 'complete' && plansUnchanged) {
				continue;
			}

			if (!activePlans.length) {
				Logger.warning({ message: `No active plans found for organization ${organization._id}.` });
			}

			//
			// Generate GTFS feed for the organization
			await organizationsCollection.updateOne({ _id: organization._id }, { $set: { 'open_data.gtfs.status': 'processing', 'open_data.gtfs.timestamp': Dates.now('Europe/Lisbon').unix_milliseconds } });
			await exportOrganizationGtfs(organization, activePlans);
			await organizationsCollection.updateOne({ _id: organization._id }, { $set: { 'open_data.gtfs.plan_hashes': planHashes, 'open_data.gtfs.status': 'complete', 'open_data.gtfs.timestamp': Dates.now('Europe/Lisbon').unix_milliseconds } });
			Logger.success({ message: `GTFS feed published for organization ${organization._id}.` });
		} catch (error) {
			Logger.error({ error, message: `Error generating GTFS feed for organization ${organization._id}.` });
			await organizationsCollection.updateOne({ _id: organization._id }, { $set: {
				'open_data.gtfs.status': 'error',
				'open_data.gtfs.timestamp': Dates.now('Europe/Lisbon').unix_milliseconds,
			} });
		}
	}

	Logger.terminate(`Run took ${globalTimer.get()}`);
}

/* * */

await runOnInterval(main, { intervalMs: '10s', throwOnError: false });
