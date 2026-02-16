/* * */

import { Dates } from '@tmlmobilidade/dates';
import { rides, simplifiedVehicleEvents } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/types';
import { MongoDbWriter, type MongoDBWriterWriteOps } from '@tmlmobilidade/writers';

/* * */

const vehicleEventsDbWritter = new MongoDbWriter<SimplifiedVehicleEvent>({
	batch_size: 500,
	batch_timeout: 10000,
	collection: await simplifiedVehicleEvents.getCollection(),
	idle_timeout: 10000,
});

/* * */

export async function processTtslVehicleEvent(newVehicleEventDocument: SimplifiedVehicleEvent) {
	//

	//
	// Write the new vehicle event document to the VehicleEvents collection

	await vehicleEventsDbWritter.write(newVehicleEventDocument, { filter: { _id: newVehicleEventDocument._id }, upsert: true }, () => null, flushCallback);

	//
};
