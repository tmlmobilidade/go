/* * */

import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';

import { processRawVehicleEvent } from './tasks/process-raw-vehicle-event.js';

/* * */

//
// Initialize Sentry

try {
	await initSentryNode();
	Logger.startNodeLogs({ app: 'pt-tml-cm-rl-rawdb-stream', message: 'Sentry Tracker CM RL RawDb Stream initialized', module: 'tracker', severity: 'info' });
} catch (error) {
	Logger.error({ error, message: 'Error initializing Sentry Tracker CM RL RawDb Stream' });
}

async function main() {
	//

	//
	// Watch for inserts on the CM RL RawVehicleEvents collection
	// and integrate those documents immediately.

	const collection = await rawDb.vehicleEvents.ptTmlCmRl.getCollection();

	collection
		.watch([{ $match: { operationType: 'insert' } }])
		.on('change', processRawVehicleEvent);

	//
}

/* * */

await main();
