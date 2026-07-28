/* * */

import { getCoreVehicleEvents } from '@/get-core-vehicle-events.js';
import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import Fastify from 'fastify';

/* * */

await (async function init() {
	//

	//
	// Reset ststaus on init

	console.log('Resetting status on init...');
	const coreVehicleEventsCollection = await rawDb.coreManagementCopy.vehicleEvents.getCollection();
	const result = await coreVehicleEventsCollection.updateMany({ status: 'processing' }, { $set: { status: 'waiting' } });
	console.log('Reset status on init:', result);

	//
	// Setup variables

	const fastify = Fastify({ logger: false });

	//
	// Setup the API services

	fastify.get('/core-vehicle-events', getCoreVehicleEvents);

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
