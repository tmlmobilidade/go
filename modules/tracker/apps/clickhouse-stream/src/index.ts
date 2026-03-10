/* * */

import { processVehicleEvent } from '@/task.js';
import { rawVehicleEvents } from '@tmlmobilidade/interfaces';

/* * */

(async function init() {
	//

	const rawVehicleEventsCollection = await rawVehicleEvents.getCollection();

	//
	// Watch for changes to the MongoDB collections
	// and integrate those documents immediately.

	rawVehicleEventsCollection.watch().on('change', processVehicleEvent);

	//
})();
