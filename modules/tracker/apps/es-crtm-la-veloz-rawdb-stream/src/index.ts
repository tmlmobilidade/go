/* * */

import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';

import { processRawVehicleEvent } from './tasks/process-raw-vehicle-event.js';

/* * */

//
// Initialize Sentry

try {
	await initSentryNode();
	Logger.startNodeLogs({ app: 'es-crtm-la-veloz-rawdb-stream', message: 'Sentry Tracker CRTM La Veloz RawDb Stream initialized', module: 'tracker', severity: 'info' });
} catch (error) {
	Logger.error({ error, message: 'Error initializing Sentry Tracker CRTM La Veloz RawDb Stream' });
}

async function main() {
	//

	//
	// Watch for inserts on the CRTM La Veloz RawVehicleEvents collection
	// and integrate those documents immediately.

	const collection = await rawDb.vehicleEvents.esCrtmLaVeloz.getCollection();

	collection
		.watch([{ $match: { operationType: 'insert' } }])
		.on('change', processRawVehicleEvent);

	//
}

/* * */

await main();
