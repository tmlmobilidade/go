/* * */

import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { Timer } from '@tmlmobilidade/timer';
import crypto from 'crypto';
import Fastify from 'fastify';
import { type FastifyRequest } from 'fastify';
import os from 'os';

/* * */

const PROCESS_ID = `${os.hostname()}-${process.pid}-${crypto.randomUUID().slice(0, 8)}`;

let IS_BUSY = false;

/* * */

await (async function init() {
	//

	console.log(`[${PROCESS_ID}] Starting...`);

	//
	// Reset ststaus on init

	console.log('Resetting status on init...');
	const coreVehicleEventsCollection = await rawDb.coreManagementCopy.vehicleEvents.getCollection();
	const result = await coreVehicleEventsCollection.updateMany({ status: { $exists: true } }, { $unset: { status: true } });
	console.log('Reset status on init:', result);

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

			console.log(`[${sessionId}] entering, busy=${IS_BUSY}`);

			if (IS_BUSY) {
				console.log(`[${sessionId}] Waiting for another request to complete... (elapsed: ${timer.get()})`);
				return null;
			}

			//
			// Set the busy flag to prevent other requests
			// from being processed until the current one is done.

			console.log(`[${sessionId}] acquired`);

			IS_BUSY = true;

			//
			// Find all Core Vehicle Events that are not already being processed,
			// sorted in descending order to prioritize the most recent Core Vehicle Events.

			const findAndUpdateTimer = new Timer();

			const coreVehicleEventsCollection = await rawDb.coreManagementCopy.vehicleEvents.getCollection();

			let qty = 0;

			console.log(`[${sessionId}] [${IS_BUSY}] Finding and updating... (fetch: ${findAndUpdateTimer.get()})`);

			for (let i = 0; i < 1_000; i++) {
				const result = await coreVehicleEventsCollection.findOneAndUpdate(
					{ status: { $exists: false } },
					{ $set: { status: sessionId } },
					{ sort: { millis: -1 } },
				);
				if (result) qty++;
			}

			console.log(`[${sessionId}] [${IS_BUSY}] New batch: Qty ${qty} (fetch: ${findAndUpdateTimer.get()})`);

			IS_BUSY = false;

			return sessionId;

			//
		} catch (error) {
			console.error(`[${sessionId}] Error getting core vehicle events: ${error.message}`);
			return null;
		}
	});

	//
	// Start the API service

	fastify.listen({ host: '::0', port: 5050 }, (err, address) => {
		if (err) {
			console.log(err);
			process.exit(1);
		}
		console.log(`Server listening at ${address}`);
	});

	//
})();
