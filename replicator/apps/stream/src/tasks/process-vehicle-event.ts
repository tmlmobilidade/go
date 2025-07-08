/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { MongoDbWriter, type MongoDBWriterWriteOps } from '@helperkits/writer';
import { rides, vehicleEvents } from '@tmlmobilidade/interfaces';
import { emailProvider } from '@tmlmobilidade/interfaces';
import { parseVehicleEvent } from '@tmlmobilidade/sae-replicator-pckg-parse';
import { ProcessingStatus, type VehicleEvent } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/* * */

const vehicleEventsDbWritter = new MongoDbWriter<VehicleEvent>({
	batch_size: 500,
	batch_timeout: 10000,
	collection: await vehicleEvents.getCollection(),
	idle_timeout: 10000,
});

/* * */

export async function processVehicleEvent(databaseOperation) {
	//

	//
	// Validate that the operation is an insert. Otherwise, send an email to the emergency contact.
	// Only insert operations are expected to occur in this PCGIDB collection.

	if (databaseOperation.operationType !== 'insert') {
		LOGGER.error('MAJOR ERROR: processVehicleEvent called with operationType different than "insert".');
		await emailProvider.send({
			subject: 'GO ERROR',
			text: `
				<h4>processVehicleEvent called with operationType different than "insert".</h4>
				<pre>${JSON.stringify(databaseOperation)}</pre>
			`,
			to: process.env.EMERGENCY_CONTACT,
		});
		return;
	}

	//
	// Extract the PCGI document from the database operation
	// and transform the vehicle timestamp into an operational date.
	// Skip the operation if the document is not valid.

	const newVehicleEventDocument = parseVehicleEvent(databaseOperation.fullDocument);
	if (!newVehicleEventDocument) {
		LOGGER.error(`Invalid Vehicle Event document, skipping operation: ${databaseOperation.fullDocument._id}`);
		return;
	}

	//
	// Setup the callback function that will be called on the DB Writer flush operation
	// to invalidate all the rides that are affected by the new data.

	const flushCallback = async (flushedData: MongoDBWriterWriteOps<VehicleEvent>[]) => {
		try {
			//

			const invalidationTimer = new TIMETRACKER();

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

			const ridesResult = await rides.updateMany({ $or: rideUpdates }, { system_status: ProcessingStatus.Waiting });

			LOGGER.info(`Flush [vehicle_events]: Marked as 'waiting': ${ridesResult.modifiedCount} Rides (${invalidationTimer.get()})`);

			//
		}
		catch (error) {
			LOGGER.error('Error in flushCallback', error);
		}
	};

	//
	// Write the new vehicle event document to the VehicleEvents collection

	await vehicleEventsDbWritter.write(newVehicleEventDocument, { filter: { _id: newVehicleEventDocument._id }, upsert: true }, () => null, flushCallback);

	//
	// Publish the heartbeats for each agency

	if (newVehicleEventDocument.agency_id === '41') fetch('https://status.carrismetropolitana.pt/api/push/B7fPoFcoIP77bgkQfL3x4PpiZRqfJAYE?status=up&msg=OK&ping=');
	if (newVehicleEventDocument.agency_id === '42') fetch('https://status.carrismetropolitana.pt/api/push/4JRIEqablXpp5FCsdrnves1UGxsGadES?status=up&msg=OK&ping=');
	if (newVehicleEventDocument.agency_id === '43') fetch('https://status.carrismetropolitana.pt/api/push/HwQXlW056WNegEqw2a5igrJIGncfyiia?status=up&msg=OK&ping=');
	if (newVehicleEventDocument.agency_id === '44') fetch('https://status.carrismetropolitana.pt/api/push/LeX8eyUo3ZI7hwXc67bahTuPydGOXK9T?status=up&msg=OK&ping=');

	//
};
