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

	const agencies = await goDb.core.agencies.findMany({ 'open_data.services.service_alerts_enabled': true }, { projection: { _id: 1, name: 1 } });

	for (const agency of agencies) {
		Logger.title(`Publishing alerts for agency ${agency._id} - ${agency.name}...`);

		await publishGtfsRtFeed(agency._id);
		await publishJsonFeed(agency._id);
		await publishRssFeed(agency._id);

		Logger.success({ message: `Finished publishing alerts for agency ${agency._id} - ${agency.name} (${globalTimer.get()})` });
	}

	//
	// Log the total time taken for all tasks

	Logger.terminate(`Publish alerts completed in ${globalTimer.get()}`);

	//
}

/* * */

await runOnInterval(main, { intervalMs: '30s' });
