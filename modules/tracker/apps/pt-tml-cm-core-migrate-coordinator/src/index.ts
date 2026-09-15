/* * */

import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import Fastify from 'fastify';

import { getCoreVehicleEventsHandler } from './handlers/get-core-vehicle-events.js';

/* * */

//
// Initialize Sentry

try {
	await initSentryNode();
	Logger.startNodeLogs({ app: 'pt-tml-cm-core-migrate-coordinator', message: 'Sentry Tracker CM Core Migrate Coordinator initialized', module: 'tracker', severity: 'info' });
} catch (error) {
	Logger.error({ error, message: 'Error initializing Sentry Tracker CM Core Migrate Coordinator' });
}

await (async function init() {
	//

	//
	// Reset the processing status of every document on init,
	// so that batches assigned by a previous instance are released.

	Logger.info({ message: 'Resetting status on init...' });

	const coreVehicleEventsCollection = await rawDb.coreManagementCopy.vehicleEvents.getCollection();
	const result = await coreVehicleEventsCollection.updateMany({ status: { $exists: true } }, { $unset: { status: true } });

	Logger.info({ message: `Reset status on init: matched ${result.matchedCount}, modified ${result.modifiedCount}` });

	//
	// Setup variables

	const fastify = Fastify({ logger: false });

	//
	// Setup the API services

	fastify.get('/core-vehicle-events/:processorInstanceId', getCoreVehicleEventsHandler);

	//
	// Start the API service

	fastify.listen({ host: '::0', port: 5050 }, (err, address) => {
		if (err) {
			Logger.error({ error: err, message: 'Error starting the coordinator server' });
			process.exit(1);
		}
		Logger.info({ message: `Server listening at ${address}` });
	});

	//
})();
