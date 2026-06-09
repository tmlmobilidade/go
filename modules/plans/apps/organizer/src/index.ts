/* * */

import { cleanOldValidations } from '@/tasks/clean-old-validations.js';
import { ensureGtfsFiles } from '@/tasks/ensure-gtfs-files.js';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger/sentry/node';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

const main = async () => {
	//

	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.logsNode({ app: 'organizer', message: 'Sentry Plans Organizer initialized', module: 'plans', severity: 'info' });
	} catch (error) {
		Logger.error('Error initializing Sentry Plans Organizer', error);
	}

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();

	//
	// Run all tasks sequentially

	await cleanOldValidations();
	await ensureGtfsFiles();

	//
	// Log the total time taken for all tasks

	Logger.terminate(`Organization completed in ${globalTimer.get()}`);

	//
};

/* * */

await runOnInterval(main, { intervalMs: '5m' });
