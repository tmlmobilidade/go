/* * */

import { processVehicleEvent } from '@/task.js';
import { rawdbVehicleEvents } from '@tmlmobilidade/go-tracker-pckg-databases';
import { simplifiedVehicleEventsNew } from '@tmlmobilidade/interfaces';

/* * */

(async function init() {
	//

	await rawdbVehicleEvents.connect();
	await simplifiedVehicleEventsNew.init();

	//
	// Watch for changes to the MongoDB collections
	// and integrate those documents immediately.

	rawdbVehicleEvents.RawVehicleEvents.watch().on('change', processVehicleEvent);

	//
})();
