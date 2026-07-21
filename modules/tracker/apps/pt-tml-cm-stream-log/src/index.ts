/* * */

import { processPcgiVehicleEventLog } from '@/process-pcgi-vehicle-event-log.js';
import { pcgiLegacy } from '@tmlmobilidade/go-interfaces-pcgi-legacy';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';

/* * */

(async function init() {
	//

	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'cm-stream-log', message: 'Sentry Tracker CM Stream Log initialized', module: 'tracker', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Tracker CM Stream Log' });
	}

	//
	// Connect to the source database

	const vehicleEventsLogCollection = await pcgiLegacy.offerApiLog.vehicleEvents.getCollection();

	//
	// Watch for changes to the MongoDB collections
	// and integrate those documents immediately.

	vehicleEventsLogCollection.watch().on('change', processPcgiVehicleEventLog);

	//
})();
