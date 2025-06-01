/* * */

import { processApexLocation } from '@/tasks/process-apex-location.js';
import { processApexValidation } from '@/tasks/process-apex-validation.js';
import { processVehicleEvent } from '@/tasks/process-vehicle-event.js';
import { PCGIDB } from '@tmlmobilidade/sae-replicator-pckg-utils';

/* * */

(async function init() {
	//

	await PCGIDB.connect();

	//
	// Watch for changes to the MongoDB collections
	// and integrate those documents immediately.

	PCGIDB.ValidationEntity.watch().on('change', processApexValidation);

	PCGIDB.LocationEntity.watch().on('change', processApexLocation);

	PCGIDB.VehicleEvents.watch().on('change', processVehicleEvent);

	//
})();
