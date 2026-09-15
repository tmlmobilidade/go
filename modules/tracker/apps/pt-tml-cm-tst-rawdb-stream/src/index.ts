/* * */

import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';

import { processRawVehicleEvent } from './tasks/process-raw-vehicle-event.js';

/* * */

//
// Initialize Sentry

try {
	await initSentryNode();
	Logger.startNodeLogs({ app: 'pt-tml-cm-tst-rawdb-stream', message: 'Sentry Tracker CM TST RawDb Stream initialized', module: 'tracker', severity: 'info' });
} catch (error) {
	Logger.error({ error, message: 'Error initializing Sentry Tracker CM TST RawDb Stream' });
}

async function main() {
	//

	//
	// Watch for inserts on the CM TST RawVehicleEvents collection
	// and integrate those documents immediately.

	const collection = await rawDb.vehicleEvents.ptTmlCmTst.getCollection();

	collection
		.watch([{ $match: { operationType: 'insert' } }])
		.on('change', processRawVehicleEvent);

	//
}

/* * */

await main();
