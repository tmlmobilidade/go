/* * */

import { processPcgiVehicleEventCore } from '@/process-pcgi-vehicle-event-core.js';
import { pcgidbLegacy } from '@tmlmobilidade/go-tracker-pckg-databases';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger/sentry/node';

/* * */

(async function init() {
	//

	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'cm-stream-core', message: 'Sentry Tracker CM Stream Core initialized', module: 'tracker', severity: 'info' });
	} catch (error) {
		Logger.error('Error initializing Sentry Tracker CM Stream Core', error);
	}

	//
	// Connect to the source database

	await pcgidbLegacy.connect();

	//
	// Watch for changes to the MongoDB collections
	// and integrate those documents immediately.

	pcgidbLegacy.VehicleEventsCore.watch().on('change', processPcgiVehicleEventCore);

	//
})();
