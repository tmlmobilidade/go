/* * */

import { processApexLocation } from '@/tasks/process-apex-location.js';
import { processApexOnBoardRefund } from '@/tasks/process-apex-on-board-refund.js';
import { processApexOnBoardSale } from '@/tasks/process-apex-on-board-sale.js';
import { processApexValidation } from '@/tasks/process-apex-validation.js';
import { processVehicleEvent } from '@/tasks/process-vehicle-event.js';
import { pcgidbLegacy, pcgidbTicketing, pcgidbValidations } from '@tmlmobilidade/interfaces';

/* * */

await (async function init() {
	//

	await pcgidbLegacy.connect();
	await pcgidbTicketing.connect();
	await pcgidbValidations.connect();

	//
	// Watch for changes to the MongoDB collections
	// and integrate those documents immediately.

	pcgidbLegacy.VehicleEvents.watch().on('change', processVehicleEvent);

	pcgidbTicketing.SalesEntity.watch().on('change', processApexOnBoardRefund);
	pcgidbTicketing.SalesEntity.watch().on('change', processApexOnBoardSale);

	pcgidbValidations.LocationEntity.watch().on('change', processApexLocation);
	pcgidbValidations.ValidationEntity.watch().on('change', processApexValidation);

	//
})();
