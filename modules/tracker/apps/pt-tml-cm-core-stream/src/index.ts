/* * */

import { pcgiLegacy } from '@tmlmobilidade/go-interfaces-pcgi-legacy';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';

import { processPcgiVehicleEventCore } from './tasks/process-pcgi-vehicle-event-core.js';

/* * */

//
// Initialize Sentry

try {
	await initSentryNode();
	Logger.startNodeLogs({ app: 'pt-tml-cm-core-stream', message: 'Sentry Tracker CM Core Stream initialized', module: 'tracker', severity: 'info' });
} catch (error) {
	Logger.error({ error, message: 'Error initializing Sentry Tracker CM Core Stream' });
}

async function main() {
	//

	//
	// Connect to the source database

	const vehicleEventsCoreCollection = await pcgiLegacy.coreManagement.vehicleEvents.getCollection();

	//
	// Watch for changes to the MongoDB collection
	// and integrate those documents immediately.

	vehicleEventsCoreCollection.watch().on('change', processPcgiVehicleEventCore);

	//
}

/* * */

await main();
