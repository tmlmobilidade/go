/* * */

import { getOrganizationAgencyIds } from '@tmlmobilidade/go-hub-pckg-utils';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { publishTripUpdates } from './tasks/gtfs/publish-trip-updates.js';
import { publishEtas } from './tasks/simplified/publish-etas.js';

/* * */

let ITERATION = 0;

async function main() {
	//

	//
	// Initialize the logger

	Logger.init();
	Logger.title(`[${ITERATION}] Publishing realtime data...`);

	const globalTimer = new Timer();

	//
	// Run all tasks sequentially

	if (ITERATION % 15 === 0) {
		const [organizations, agencies] = await Promise.all([goDb.core.organizations.findMany(), goDb.core.agencies.findMany()]);
		for (const organization of organizations) {
			const agencyIds = getOrganizationAgencyIds(organization, agencies, 'eta_enabled');
			const results = await Promise.allSettled([
				publishEtas(organization._id, agencyIds),
				publishTripUpdates(organization._id, agencyIds),
			]);
			for (const result of results) {
				if (result.status === 'rejected') Logger.error({ error: result.reason, message: `Error publishing ETA for organization ${organization._id}.` });
			}
		}
	}

	ITERATION++;

	//
	// Log the total time taken for all tasks

	Logger.terminate(`[${ITERATION}] Publish realtime data completed in ${globalTimer.get()}`);

	//
}

/* * */

await runOnInterval(main, { intervalMs: '1s' });
