/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { publishAgencies } from './tasks/publish-agencies.js';
import { publishApprovedPlans } from './tasks/publish-approved-plans.js';
import { publishOrganizations } from './tasks/publish-organizations.js';

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

	await publishOrganizations();

	for (const organization of await goDb.core.organizations.findMany()) {
		try {
			await publishApprovedPlans(organization);
		} catch (error) {
			Logger.error({ error, message: `Error publishing plans for organization ${organization._id}.` });
		}
	}

	//
	// Log the total time taken for all tasks

	Logger.terminate(`Publish plans data completed in ${globalTimer.get()}`);

	//
}

/* * */

await runOnInterval(main, { intervalMs: '30m' });
