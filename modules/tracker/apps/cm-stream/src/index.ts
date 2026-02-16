/* * */

import { processPcgiVehicleEvent } from '@/process-vehicle-event.js';
import { pcgidbLegacy } from '@tmlmobilidade/interfaces';

/* * */

(async function init() {
	//

	await pcgidbLegacy.connect();

	//
	// Watch for changes to the MongoDB collections
	// and integrate those documents immediately.

	pcgidbLegacy.VehicleEventsCore.watch().on('change', processPcgiVehicleEvent);
	pcgidbLegacy.VehicleEventsLog.watch().on('change', processPcgiVehicleEvent);

	//
})();
