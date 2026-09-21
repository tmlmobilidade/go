/* * */

import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { publishVehiclesPositions } from './tasks/publish-vehicle-positions.js';
import { publishVehiclesMetadata } from './tasks/publish-vehicles-metadata.js';

/* * */

let ITERATION = 0;

//
// Initialize Sentry

try {
	await initSentryNode();
	Logger.startNodeLogs({ app: 'publish-vehicles', message: 'Sentry Hub Publish Vehicles initialized', module: 'hub', severity: 'info' });
} catch (error) {
	Logger.error({ error, message: 'Error initializing Sentry Hub Publish Vehicles' });
}

async function main() {
	//

	//
	// Initialize the logger

	Logger.init();
	Logger.title(`[${ITERATION}] Publishing realtime data...`);

	const globalTimer = new Timer();

	//
	// Run all tasks sequentially

	await publishVehiclesPositions();

	if (ITERATION % 100 === 0) await publishVehiclesMetadata(); // Every 100 iterations * 1s + execution time

	ITERATION++;

	//
	// Log the total time taken for all tasks

	Logger.terminate(`[${ITERATION}] Publish realtime data completed in ${globalTimer.get()}`);

	//
}

/* * */

await runOnInterval(main, { intervalMs: '1s' });
