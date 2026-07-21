/* * */

import { processPcgiVehicleEventLog } from '@/process-pcgi-vehicle-event-log.js';
import { pcgidbLegacy } from '@tmlmobilidade/go-tracker-pckg-databases';
import { initSentry, Logger } from '@tmlmobilidade/logger-logger-backend';

/* * */

(async function init() {
	//

	// Initialize Sentry

	try {
		await initSentry();
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Tracker CM Stream Log' });
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
