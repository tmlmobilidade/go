/* * */

import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

let IS_BUSY = false;

/* * */

export async function getCoreVehicleEvents(): Promise<string[]> {
	//

	const timer = new Timer();
	const sessionId = Math.random().toString(36).substring(2, 5).toUpperCase();

	try {
		//

		//
		// The whole point of a coordinator is to prevent multiple instances
		// from processing the same documents at the same time. For that reason,
		// we need to make sure that instances request the next batch of documents
		// sequentially. To do that, we implement a simple lock mechanism.

		while (IS_BUSY) {
			Logger.info({ message: `[${sessionId}] Waiting for another request to complete... (elapsed: ${timer.get()})` });
			return [];
		}

		//
		// Set the busy flag to prevent other requests
		// from being processed until the current one is done.

		IS_BUSY = true;

		//
		// Find all Core Vehicle Events that are not already being processed,
		// sorted in descending order to prioritize the most recent Core Vehicle Events.

		const fetchTimer = new Timer();

		const coreVehicleEventsCollection = await rawDb.coreManagementCopy.vehicleEvents.getCollection();

		const latestCoreVehicleEvents = await coreVehicleEventsCollection
			.find({ status: { $ne: 'processing' } }, { limit: 1_000, projection: { _id: 1 }, sort: { millis: -1 } })
			.toArray();

		/* === FOR TESTING === */
		// const latestWaitingRides = await rides.findMany({ _id: 'DC0XN-44-20250303-4412_0_2|300|1955' })
		/* === FOR TESTING === */

		const fetchTimerResult = fetchTimer.get();

		if (!latestCoreVehicleEvents.length) {
			Logger.info({ message: `[${sessionId}] No core vehicle events to process (fetch: ${fetchTimerResult})` });
			return [];
		}

		//
		// Mark those Rides as 'processing' to ensure the next batch of Rdes does not include them,
		// and return them to the caller instance.

		const markTimer = new Timer();

		const latestCoreVehicleEventsIds = latestCoreVehicleEvents.map(item => item._id);

		await coreVehicleEventsCollection.updateMany({ _id: { $in: latestCoreVehicleEventsIds } }, { $set: { status: 'processing' } });

		Logger.info({ message: `[${sessionId}] New batch: Qty ${latestCoreVehicleEventsIds.length} (fetch: ${fetchTimerResult} | total: ${markTimer.get()})` });

		return latestCoreVehicleEventsIds;

		//
	} catch (error) {
		Logger.error({ error, message: `[${sessionId}] Error getting core vehicle events: ${error.message}` });
		return [];
	} finally {
		IS_BUSY = false;
	}
}
