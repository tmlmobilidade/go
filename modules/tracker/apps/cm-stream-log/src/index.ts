/* * */

import { processPcgiVehicleEventLog } from '@/process-pcgi-vehicle-event-log.js';
import { pcgidbLegacy } from '@tmlmobilidade/go-tracker-pckg-databases';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger';

/* * */

(async function init() {
	//

	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'cm-stream-log', message: 'Sentry Tracker CM Stream Log initialized', module: 'tracker', severity: 'info' });
	} catch (error) {
		Logger.error('Error initializing Sentry Tracker CM Stream Log', error);
	}

	//
	// Connect to the source database

	await pcgidbLegacy.connect();

	//
	// Watch for changes to the MongoDB collections
	// and integrate those documents immediately.

	pcgidbLegacy.VehicleEventsLog.watch().on('change', processPcgiVehicleEventLog);

	//
})();
