/* * */

import { processPcgiVehicleEventCore } from '@/process-pcgi-vehicle-event-core.js';
import { pcgiLegacy } from '@tmlmobilidade/go-interfaces-pcgi-legacy';

/* * */

(async function init() {
	//

	//
	// Connect to the source database

	const vehicleEventsCoreCollection = await pcgiLegacy.coreManagement.vehicleEvents.getCollection();

	//
	// Watch for changes to the MongoDB collections
	// and integrate those documents immediately.

	vehicleEventsCoreCollection.watch().on('change', processPcgiVehicleEventCore);

	//
})();
