/* * */

import { Dates } from '@tmlmobilidade/dates';
import { parseVehicleEvent } from '@tmlmobilidade/go-replicator-pckg-parse';
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

export async function processVehicleEvent(databaseOperation) {
	//

	//
	// Validate that the operation is an insert. Otherwise, send an email to the emergency contact.
	// Only insert operations are expected to occur in this PCGIDB collection.

	if (databaseOperation.operationType !== 'insert') {
		Logger.error({ message: 'MAJOR ERROR: processVehicleEvent called with operationType different than "insert".' });
		return;
	}

	//
	// Extract the PCGI document from the database operation
	// and transform the vehicle timestamp into an operational date.
	// Skip the operation if the document is not valid.

	const newVehicleEventDocument = parseVehicleEvent(databaseOperation.fullDocument);

	if (!newVehicleEventDocument) {
		Logger.error({ message: `Invalid Vehicle Event document, skipping operation: ${databaseOperation.fullDocument._id}` });
		return;
	}

	//
	// Setup the callback function that will be called on the DB Writer flush operation
	// to invalidate all the rides that are affected by the new data.

	const flushCallback = async (flushedData: MongoDBWriterWriteOps<SimplifiedVehicleEvent>[]) => {
		try {
			//

			const invalidationTimer = new Timer();

			//
			// Map the flushed data to the query that will be used to invalidate documents

			const rideUpdates = flushedData.map((writeOp) => {
				const standardWindowInterval = Dates.fromUnixTimestamp(writeOp.data.created_at).std_window;
				return {
					start_time_scheduled: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end },
					trip_id: writeOp.data.trip_id,
				};
			});

			//
			// Invalidate all rides that are affected

			if (!rideUpdates.length) {
				Logger.info({ message: 'Flush [simplified_vehicle_events]: No rides to mark as waiting.' });
				return;
			}

			const ridesResult = await rides.updateMany({ $or: rideUpdates }, { system_status: 'waiting' }, { returnResults: false });

			Logger.info({ message: `Flush [simplified_vehicle_events]: Marked as 'waiting': ${ridesResult.modifiedCount} Rides (${invalidationTimer.get()})` });

			//
		} catch (error) {
			Logger.error({ error, message: 'Error in flushCallback' });
		}
	};

	//
	// Write the new document to the VehicleEvents collection

	await vehicleEventsDbWritter.write(
		newVehicleEventDocument,
		{ filter: { _id: newVehicleEventDocument._id }, upsert: true },
		() => null, flushCallback,
	);

	//
	// Publish the heartbeats for each agency

	if (newVehicleEventDocument.agency_id === '41') await fetch('https://status.carrismetropolitana.pt/api/push/B7fPoFcoIP77bgkQfL3x4PpiZRqfJAYE');
	if (newVehicleEventDocument.agency_id === '42') await fetch('https://status.carrismetropolitana.pt/api/push/4JRIEqablXpp5FCsdrnves1UGxsGadES');
	if (newVehicleEventDocument.agency_id === '43') await fetch('https://status.carrismetropolitana.pt/api/push/HwQXlW056WNegEqw2a5igrJIGncfyiia');
	if (newVehicleEventDocument.agency_id === '44') await fetch('https://status.carrismetropolitana.pt/api/push/LeX8eyUo3ZI7hwXc67bahTuPydGOXK9T');

	//
};
