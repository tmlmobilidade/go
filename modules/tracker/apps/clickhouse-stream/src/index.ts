/* * */

import { processVehicleEvent } from '@/task.js';
import { rawdbVehicleEvents } from '@tmlmobilidade/go-tracker-pckg-databases';

/* * */

(async function init() {
	//

	await rawdbVehicleEvents.connect();

	//
	// Watch for changes to the MongoDB collections
	// and integrate those documents immediately.

	rawdbVehicleEvents.RawVehicleEvents.watch().on('change', processVehicleEvent);

	//
})();
