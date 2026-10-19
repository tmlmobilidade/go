/* * */

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

	await publishGtfsRtFeed();

	await publishJsonFeed();

	await publishRssFeed();

	//
	// Publish feeds for each organization's agencies.

	const organizationsCollection = await goDb.core.organizations.getCollection();
	const organizations = await organizationsCollection.find({ 'agency_ids': { $exists: true }, 'open_data.realtime.alerts': true }).toArray();

	for (const organization of organizations) {
		Logger.info({ message: `Publishing alerts for organization ${organization._id}...` });

		await publishGtfsRtFeed(organization);
		await publishJsonFeed(organization);
		await publishRssFeed(organization);
	}

	//
	// Log the total time taken for all tasks

	Logger.terminate(`Publish alerts completed in ${globalTimer.get()}`);

	//
}

/* * */

await runOnInterval(main, { intervalMs: '30s' });
