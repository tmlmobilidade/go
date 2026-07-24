/* * */

import { processPcgiVehicleEventCore } from '@/process-pcgi-vehicle-event-core.js';
import { pcgiLegacy } from '@tmlmobilidade/go-interfaces-pcgi-legacy';
import { initSentry, Logger } from '@tmlmobilidade/logger-logger-backend';

/* * */

(async function init() {
	//

	// Initialize Sentry

	try {
		await initSentry();
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Tracker CM Stream Core' });
	}

	//
	// Connect to the source database

	const vehicleEventsCoreCollection = await pcgiLegacy.coreManagement.vehicleEvents.getCollection();

	//
	// Watch for changes to the MongoDB collections
	// and integrate those documents immediately.

	vehicleEventsCoreCollection.watch().on('change', processPcgiVehicleEventCore);

	//
})();
