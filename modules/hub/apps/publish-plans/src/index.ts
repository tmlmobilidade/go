/* * */

import { publishApprovedPlans } from '@/tasks/publish-approved-plans.js';
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
		Logger.logsNode({ app: 'publish-plans', message: 'Sentry Hub Publish Plans initialized', module: 'hub', severity: 'info' });
	} catch (error) {
		Logger.error('Error initializing Sentry Hub Publish Plans', error);
	}

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();

	//
	// Run all tasks sequentially

	await publishApprovedPlans();

	//
	// Log the total time taken for all tasks

	Logger.terminate(`Publish plans data completed in ${globalTimer.get()}`);

	//
};

/* * */

await runOnInterval(main, { intervalMs: '30m' });
