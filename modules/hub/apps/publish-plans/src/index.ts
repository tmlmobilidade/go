/* * */

import { publishApprovedPlans } from '@/tasks/publish-approved-plans.js';
import { initSentry, Logger } from '@tmlmobilidade/logger-backend';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

const main = async () => {
	//

	//
	// Initialize Sentry

	try {
		await initSentry();
		Logger.startLogs({ app: 'publish-plans', message: 'Sentry Hub Publish Plans initialized', module: 'hub', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Hub Publish Plans' });
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
