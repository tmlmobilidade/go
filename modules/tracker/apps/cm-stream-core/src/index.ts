/* * */

import { processPcgiVehicleEventCore } from '@/process-pcgi-vehicle-event-core.js';
import { pcgidbLegacy } from '@tmlmobilidade/go-tracker-pckg-databases';

/* * */

(async function init() {
	//

	await pcgidbLegacy.connect();

	//
	// Watch for changes to the MongoDB collections
	// and integrate those documents immediately.

	pcgidbLegacy.VehicleEventsCore.watch().on('change', processPcgiVehicleEventCore);

	//
})();
