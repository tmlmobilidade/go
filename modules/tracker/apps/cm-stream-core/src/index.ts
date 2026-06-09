/* * */

import { processPcgiVehicleEventCore } from '@/process-pcgi-vehicle-event-core.js';
import { pcgidbLegacy } from '@tmlmobilidade/go-tracker-pckg-databases';

/* * */

(async function init() {
	//

	// Initialize Sentry

	// TODO fix PCGI Connection for dont give error on connection
	// try {
	// 	await initSentryNode();
	// 	Logger.logsNode({ app: 'cm-stream-core', message: 'Sentry Tracker CM Stream Core initialized', module: 'tracker', severity: 'info' });
	// } catch (error) {
	// 	Logger.error('Error initializing Sentry Tracker CM Stream Core', error);
	// }

	//
	// Connect to the source database

	await pcgidbLegacy.connect();

	//
	// Watch for changes to the MongoDB collections
	// and integrate those documents immediately.

	pcgidbLegacy.VehicleEventsCore.watch().on('change', processPcgiVehicleEventCore);

	//
})();
