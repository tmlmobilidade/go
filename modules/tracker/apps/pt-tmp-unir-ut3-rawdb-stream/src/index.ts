/* * */

import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';

import { processRawVehicleEvent } from './tasks/process-raw-vehicle-event.js';

/* * */

//
// Initialize Sentry

try {
	await initSentryNode();
	Logger.startNodeLogs({ app: 'pt-tmp-unir-ut3-rawdb-stream', message: 'Sentry Tracker TMP UNIR UT3 RawDb Stream initialized', module: 'tracker', severity: 'info' });
} catch (error) {
	Logger.error({ error, message: 'Error initializing Sentry Tracker TMP UNIR UT3 RawDb Stream' });
}

async function main() {
	//

	//
	// Watch for inserts on the TMP UNIR UT3 RawVehicleEvents collection
	// and integrate those documents immediately.

	const collection = await rawDb.vehicleEvents.ptTmpUnirUt3.getCollection();

	collection
		.watch([{ $match: { operationType: 'insert' } }])
		.on('change', processRawVehicleEvent);

	//
}

/* * */

await main();
