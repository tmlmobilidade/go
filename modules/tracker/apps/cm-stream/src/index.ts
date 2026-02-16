/* * */

import { syncPcgiCore } from '@/tasks/pcgi-core.js';
import { syncPcgiLog } from '@/tasks/pcgi-log.js';
import { processVehicleEvent } from '@/tasks/process-vehicle-event.js';
import { pcgidbLegacy } from '@tmlmobilidade/interfaces';

/* * */

(async function init() {
	//

	await pcgidbLegacy.connect();

	//
	// Watch for changes to the MongoDB collections
	// and integrate those documents immediately.

	pcgidbLegacy.VehicleEventsCore.watch().on('change', processVehicleEvent);

	//
	// Perform a hard sync of all documents every 30 minutes,
	// to ensure that any missed documents are eventually integrated.

	const runOnInterval = async () => {
		await syncPcgiCore();
		await syncPcgiLog();
		setTimeout(runOnInterval, 1_800_000); // 30 minutes
	};

	runOnInterval();

	//
})();
