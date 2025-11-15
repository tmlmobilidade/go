/* * */

import { processApexLocation } from '@/tasks/process-apex-location.js';
import { processApexOnBoardRefund } from '@/tasks/process-apex-on-board-refund.js';
import { processApexOnBoardSale } from '@/tasks/process-apex-on-board-sale.js';
import { processApexValidation } from '@/tasks/process-apex-validation.js';
import { processVehicleEvent } from '@/tasks/process-vehicle-event.js';
import { pcgidb } from '@tmlmobilidade/interfaces';

/* * */

(async function init() {
	//

	await pcgidb.connect();

	//
	// Watch for changes to the MongoDB collections
	// and integrate those documents immediately.

	pcgidb.LocationEntity.watch().on('change', processApexLocation);

	pcgidb.SalesEntity.watch().on('change', processApexOnBoardRefund);

	pcgidb.SalesEntity.watch().on('change', processApexOnBoardSale);

	pcgidb.ValidationEntity.watch().on('change', processApexValidation);

	pcgidb.VehicleEvents.watch().on('change', processVehicleEvent);

	//
})();
