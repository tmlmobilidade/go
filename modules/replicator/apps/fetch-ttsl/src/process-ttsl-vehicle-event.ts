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
					agency_id: writeOp.data.agency_id,
					start_time_scheduled: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end },
					trip_id: writeOp.data.trip_id,
				};
			});

			//
			// Invalidate all rides that are affected

			if (!rideUpdates.length) {
				Logger.info('Flush [simplified_vehicle_events]: No rides to mark as waiting.');
				return;
			}

			const ridesResult = await rides.updateMany({ $or: rideUpdates }, { system_status: 'waiting' }, { returnResults: false });

			Logger.info(`Flush [simplified_vehicle_events]: Marked as 'waiting': ${ridesResult.modifiedCount} Rides (${invalidationTimer.get()})`);

			//
		}
		catch (error) {
			Logger.error('Error in flushCallback', error);
		}
	};

	//
	// Write the new vehicle event document to the VehicleEvents collection

	await vehicleEventsDbWritter.write(newVehicleEventDocument, { filter: { _id: newVehicleEventDocument._id }, upsert: true }, () => null, flushCallback);

	//
};
