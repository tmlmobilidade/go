/* * */

import { processVehicleEvent } from '@/task.js';
import { rawVehicleEventsNew } from '@tmlmobilidade/databases';

/* * */

(async function init() {
	//

	//
	// Watch for changes to the rawVehicleEventsNew collection
	// and integrate those documents immediately.

	const collection = await rawVehicleEventsNew.getCollection();

	const changeStream = collection.watch();

	for await (const change of changeStream) {
		await processVehicleEvent(change);
	}

	//
})();
