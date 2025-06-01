/* * */

import { processApexLocation } from '@/tasks/process-apex-location.js';
import { processApexOnBoardRefund } from '@/tasks/process-apex-on-board-refund.js';
import { processApexOnBoardSale } from '@/tasks/process-apex-on-board-sale.js';
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

	PCGIDB.LocationEntity.watch().on('change', processApexLocation);

	PCGIDB.SalesEntity.watch().on('change', processApexOnBoardRefund);

	PCGIDB.SalesEntity.watch().on('change', processApexOnBoardSale);

	PCGIDB.ValidationEntity.watch().on('change', processApexValidation);

	PCGIDB.VehicleEvents.watch().on('change', processVehicleEvent);

	//
})();
