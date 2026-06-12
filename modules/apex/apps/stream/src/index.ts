/* * */

import { processApexLocation } from '@/tasks/process-apex-location.js';
import { pcgiLocations, pcgiSales, pcgiValidations } from '@tmlmobilidade/databases';

/* * */

(async function init() {
	//

	//
	// Watch for changes to the rawVehicleEventsNew collection
	// and integrate those documents immediately.
	// Validate that the operation is an insert or update.
	// Only insert operations are expected to occur in this PCGIDB collection.

	// LOCATIONS

	const pcgiLocationsCollection = await pcgiLocations.getCollection();
	const pcgiLocationsChangeStream = pcgiLocationsCollection.watch();
	pcgiLocationsChangeStream.on('change', processApexLocation);

	// SALES

	const pcgiSalesCollection = await pcgiSales.getCollection();
	const pcgiSalesChangeStream = pcgiSalesCollection.watch();
	// pcgiSalesChangeStream.on('change', processApexOnBoardSale);
	// pcgiSalesChangeStream.on('change', processApexOnBoardRefund);

	// VALIDATIONS

	const pcgiValidationsCollection = await pcgiValidations.getCollection();
	const pcgiValidationsChangeStream = pcgiValidationsCollection.watch();
	// pcgiValidationsChangeStream.on('change', processApexValidation);

	//
})();
