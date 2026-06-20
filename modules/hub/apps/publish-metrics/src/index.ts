/* * */

import { publishDemandByAgencyByOperationalDate } from '@/tasks/demand-by-agency-by-operational-date.js';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

const main = async () => {
	//

	//
	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'publish-metrics', message: 'Sentry Hub Publish Metrics initialized', module: 'hub', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Hub Publish Metrics' });
	}

	//
	// Initialize the logger

	Logger.init();
	Logger.title(`Starting metrics data publishing...`);

	const globalTimer = new Timer();

	//
	// Run all tasks sequentially

	await publishDemandByAgencyByOperationalDate();

	//
	// Log the total time taken for all tasks

	Logger.terminate(`Finished publishing metrics data (${globalTimer.get()})`);

	//
};

/* * */

await runOnInterval(main, { intervalMs: '30s' });
