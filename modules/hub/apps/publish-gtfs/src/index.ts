/* * */

import { runOnInterval } from '@tmlmobilidade/utils';
import { initSentryNode } from '@tmlmobilidade/logger/sentry/node';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

const main = async () => {
	//

	//
	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.info('');
		Logger.logsNode({ app: 'publish-gtfs', message: 'Sentry Hub Publish GTFS initialized', module: 'hub', severity: 'info' });
	} catch (error) {
		Logger.error('Error initializing Sentry Hub Publish GTFS', error);
	}

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();
	await main();

	Logger.terminate(`Publish GTFS completed in ${globalTimer.get()}`);
};

await runOnInterval(main, { intervalMs: '1h', throwOnError: false });