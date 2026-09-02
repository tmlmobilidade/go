/* * */

import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { ensureAlertsStructure } from './tasks/ensure-alerts-structure.js';
import { ensureGtfsFiles } from './tasks/ensure-gtfs-files.js';

/* * */

const main = async () => {
	//

	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'organizer', message: 'Sentry Plans Organizer initialized', module: 'plans', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Plans Organizer' });
	}

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();

	//
	// Run all tasks sequentially

	await ensureGtfsFiles();
	await ensureAlertsStructure();

	//
	// Log the total time taken for all tasks

	Logger.terminate(`Organization completed in ${globalTimer.get()}`);

	//
};

/* * */

await runOnInterval(main, { intervalMs: '5m' });
