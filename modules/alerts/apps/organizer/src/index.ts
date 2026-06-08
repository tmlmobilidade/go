/* * */

import { ensureStructure } from '@/tasks/ensure-structure.js';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger/sentry/node';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

const main = async () => {
	//

	try {
		await initSentryNode();
		Logger.info('');
		Logger.logsNode({ app: 'organizer', message: 'Sentry Alerts Organizer initialized', module: 'alerts', severity: 'info' });
	} catch (error) {
		Logger.error('Error initializing Sentry Alerts Organizer', { app: 'organizer', message: 'Error initializing Sentry Alerts Organizer', module: 'alerts', severity: 'error', value: error });
	}

	const globalTimer = new Timer();

	//
	// Run all tasks sequentially

	await ensureStructure();

	//
	// Log the total time taken for all tasks

	Logger.terminate(`Organization completed in ${globalTimer.get()}`);

	//
};

/* * */

await runOnInterval(main, { intervalMs: '1h' });
