/* * */

import { publishGtfsRtFeed } from '@/tasks/publish-gtfs-rt-feed.js';
import { publishJsonFeed } from '@/tasks/publish-json-feed.js';
import { publishRssFeed } from '@/tasks/publish-rss-feed.js';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger/sentry/node';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

const main = async () => {
	//

	//
	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.info('');
		Logger.logsNode({ app: 'publish-alerts-cm', message: 'Sentry Hub Publish Alerts CM initialized', module: 'hub', severity: 'info' });
	} catch (error) {
		Logger.error('Error initializing Sentry Hub Publish Alerts CM', error);
	}

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
	// Log the total time taken for all tasks

	Logger.terminate(`Publish alerts completed in ${globalTimer.get()}`);

	//
};

/* * */

await runOnInterval(main, { intervalMs: '30s' });
