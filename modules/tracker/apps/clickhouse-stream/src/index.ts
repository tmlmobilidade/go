/* * */

import { processVehicleEvent } from '@/task.js';
import { rawVehicleEventsNew } from '@tmlmobilidade/databases';

/* * */

(async function init() {
	//

	//
	// Watch for changes to the rawVehicleEventsNew collection
	// and integrate those documents immediately.

	rawVehicleEventsNew.watch().on('change', processVehicleEvent);

	//
})();
