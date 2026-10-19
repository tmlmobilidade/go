/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { publishAgencies } from './tasks/publish-agencies.js';
import { publishApprovedPlans } from './tasks/publish-approved-plans.js';

/* * */

async function main() {
	//

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();

	//
	// Run all tasks sequentially

	await publishAgencies();

	await publishApprovedPlans();

	//
	// Publish feeds for each organization's agencies.

	const organizationsCollection = await goDb.core.organizations.getCollection();
	const organizations = await organizationsCollection.find({ 'agency_ids': { $exists: true }, 'open_data.plans.enabled': true }).toArray();

	for (const organization of organizations) {
		Logger.info({ message: `Publishing plans data for organization ${organization._id}...` });

		await publishAgencies(organization);
		await publishApprovedPlans(organization);
	}

	//
	// Log the total time taken for all tasks

	Logger.terminate(`Publish plans data completed in ${globalTimer.get()}`);

	//
}

/* * */

await runOnInterval(main, { intervalMs: '30m' });
