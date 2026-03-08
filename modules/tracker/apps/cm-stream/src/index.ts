/* * */

import { processPcgiVehicleEvent } from '@/process-pcgi-vehicle-event.js';
import { type ChangeStreamDocument, pcgidbLegacy } from '@tmlmobilidade/interfaces';
import { type PcgiVehicleEvent } from '@tmlmobilidade/types';

/* * */

await pcgidbLegacy.connect();

//
// Handle the database operation. Ensure it is an insert operation.
// Only insert operations are expected to occur in this PCGIDB collection.

async function handleDatabaseOperation(databaseOperation: ChangeStreamDocument<PcgiVehicleEvent>) {
	if (databaseOperation.operationType !== 'insert') return;
	await processPcgiVehicleEvent(databaseOperation.fullDocument);
}

//
// Watch for changes to the MongoDB collections
// and integrate those documents immediately.

pcgidbLegacy.VehicleEventsCore.watch().on('change', handleDatabaseOperation);
pcgidbLegacy.VehicleEventsLog.watch().on('change', handleDatabaseOperation);
