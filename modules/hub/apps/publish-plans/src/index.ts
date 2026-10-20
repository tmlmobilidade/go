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
	// Get a set of agency IDs where open data is enabled in an organization

	const collection = await goDb.core.organizations.getCollection();
	const agencyIds = await collection.aggregate([
		{ $match: { 'agency_ids.0': { $exists: true }, 'open_data.enabled': true } },
		{ $unwind: '$agency_ids' },
		{ $group: { _id: null, agency_ids: { $addToSet: '$agency_ids' } } },
		{ $project: { _id: 0, agency_ids: 1 } },
	]).toArray()[0]?.agency_ids ?? [];

	//
	// Run all tasks sequentially

	await publishAgencies(agencyIds);
	await publishApprovedPlans(agencyIds);

	//
	// Log the total time taken for all tasks

	Logger.terminate(`Publish plans data completed in ${globalTimer.get()}`);

	//
}

/* * */

await runOnInterval(main, { intervalMs: '30m' });
