/* * */

import { processVehicleEvent } from '@/tasks/process-vehicle-event.js';
import { pcgidbLegacy, pcgidbTicketing, pcgidbValidations } from '@tmlmobilidade/interfaces';

/* * */

(async function init() {
	//

	await pcgidbLegacy.connect();
	await pcgidbTicketing.connect();
	await pcgidbValidations.connect();

	//
	// Watch for changes to the MongoDB collections
	// and integrate those documents immediately.

	pcgidbLegacy.VehicleEvents.watch().on('change', processVehicleEvent);

	//
})();
