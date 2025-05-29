/* * */

import PCGIDB from '@/services/PCGIDB.js';
import { handleApexLocations } from '@/tasks/handle-apex-locations.js';
import { handleApexOnBoardRefunds } from '@/tasks/handle-apex-on-board-refunds.js';
import { handleApexOnBoardSales } from '@/tasks/handle-apex-on-board-sales.js';
import { handleApexValidations } from '@/tasks/handle-apex-validations.js';
import { processVehicleEvent } from '@/tasks/process-vehicle-event.js';

/* * */

(async function init() {
	//

	await PCGIDB.connect();

	//
	// Watch for changes to the MongoDB collections
	// and integrate those documents immediately.

	PCGIDB.SalesEntity.watch().on('change', handleApexOnBoardRefunds);

	PCGIDB.SalesEntity.watch().on('change', handleApexOnBoardSales);

	PCGIDB.ValidationEntity.watch().on('change', handleApexValidations);

	PCGIDB.LocationEntity.watch().on('change', handleApexLocations);

	PCGIDB.VehicleEvents.watch().on('change', processVehicleEvent);

	//
})();
