/* * */

import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import Fastify from 'fastify';
import { type FastifyRequest } from 'fastify';

/* * */

const PROCESS_ID = `${process.pid}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

let IS_BUSY = false;

/* * */

await (async function init() {
	//

	Logger.info({ message: `[${PROCESS_ID}] Starting...` });

	//
	// Reset ststaus on init

	Logger.info({ message: 'Resetting status on init...' });
	const coreVehicleEventsCollection = await rawDb.coreManagementCopy.vehicleEvents.getCollection();
	const result = await coreVehicleEventsCollection.updateMany({ status: { $exists: true } }, { $unset: { status: true } });
	Logger.info({ message: `Reset status on init: ${result.modifiedCount}` });

	//
	// Setup variables

	const fastify = Fastify({ logger: false });

	//
	// Setup the API services

	fastify.get('/core-vehicle-events/:processorInstanceId', async (request: FastifyRequest<{ Params: { processorInstanceId: string } }>): Promise<null | string> => {
		//

		const timer = new Timer();
		const sessionId = `${PROCESS_ID}-${request.params.processorInstanceId}`;

		try {
			//

			//
			// The whole point of a coordinator is to prevent multiple instances
			// from processing the same documents at the same time. For that reason,
			// we need to make sure that instances request the next batch of documents
			// sequentially. To do that, we implement a simple lock mechanism.

			if (IS_BUSY) {
				Logger.info({ message: `[${sessionId}] Waiting for another request to complete... (elapsed: ${timer.get()})` });
				return null;
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
				.find({ status: { $exists: false } }, { limit: 5_000, projection: { _id: 1 }, sort: { millis: -1 } })
				.toArray();

			/* === FOR TESTING === */
			// const latestWaitingRides = await rides.findMany({ _id: 'DC0XN-44-20250303-4412_0_2|300|1955' })
			/* === FOR TESTING === */

			const fetchTimerResult = fetchTimer.get();

			if (!latestCoreVehicleEvents.length) {
				Logger.info({ message: `[${sessionId}] No core vehicle events to process (fetch: ${fetchTimerResult})` });
				return null;
			}

			//
			// Mark those Rides as 'processing' to ensure the next batch of Rdes does not include them,
			// and return them to the caller instance.

			const markTimer = new Timer();

			const latestCoreVehicleEventsIds = latestCoreVehicleEvents.map(item => item._id);

			await coreVehicleEventsCollection.updateMany({ _id: { $in: latestCoreVehicleEventsIds } }, { $set: { status: sessionId } });

			Logger.info({ message: `[${sessionId}] New batch: Qty ${latestCoreVehicleEventsIds.length} (fetch: ${fetchTimerResult} | total: ${markTimer.get()})` });

			IS_BUSY = false;

			return sessionId;

			//
		} catch (error) {
			Logger.error({ error, message: `[${sessionId}] Error getting core vehicle events` });
			return null;
		}
	});

	//
	// Start the API service

	fastify.listen({ host: '::0', port: 5050 }, (err, address) => {
		if (err) {
			Logger.critical({ error: err, message: 'Error starting the API service' });
			process.exit(1);
		}
		Logger.info({ message: `Server listening at ${address}` });
	});

	//
})();
