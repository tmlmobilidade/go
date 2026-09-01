/* * */

import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { setStopLocationTask } from './tasks/set-stop-location.js';

/* * */

async function main() {
	//

	//
	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'organizer', message: 'Sentry Stops Organizer initialized', module: 'stops', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Stops Organizer' });
	}

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();

	//
	// Run tasks

	await setStopLocationTask();

	//
	// Log completion

	Logger.terminate(`Tasks completed in ${globalTimer.get()}`);

	//
}

/* * */

await runOnInterval(main, { intervalMs: '5m' });
