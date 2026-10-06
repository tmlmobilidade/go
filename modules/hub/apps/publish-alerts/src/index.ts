/* * */

import { getOrganizationAgencyIds } from '@tmlmobilidade/go-hub-pckg-utils';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { publishGtfsRtFeed } from './tasks/publish-gtfs-rt-feed.js';
import { publishJsonFeed } from './tasks/publish-json-feed.js';
import { publishRssFeed } from './tasks/publish-rss-feed.js';

/* * */

async function main() {
	//

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();

	//
	// Run all tasks sequentially

	const [organizations, agencies] = await Promise.all([goDb.core.organizations.findMany(), goDb.core.agencies.findMany()]);

	for (const organization of organizations) {
		try {
			const agencyIds = getOrganizationAgencyIds(organization, agencies, 'service_alerts_enabled');
			await publishGtfsRtFeed(organization, agencyIds);
			await publishJsonFeed(organization, agencyIds);
			await publishRssFeed(organization, agencyIds);
		} catch (error) {
			Logger.error({ error, message: `Error publishing alerts for organization ${organization._id}.` });
		}
	}

	//
	// Log the total time taken for all tasks

	Logger.terminate(`Publish alerts completed in ${globalTimer.get()}`);

	//
}

/* * */

await runOnInterval(main, { intervalMs: '30s' });
