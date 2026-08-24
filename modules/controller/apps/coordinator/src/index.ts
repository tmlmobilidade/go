/* * */

import { getRides } from '@/get-rides.js';
import { initSentry, Logger } from '@tmlmobilidade/logger-logger-backend';
import Fastify from 'fastify';

/* * */

await (async function init() {
	//

	//
	// Initialize Sentry

	try {
		await initSentry();
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Coordinator' });
	}

	//
	// Setup variables

	const fastify = Fastify({ logger: false });

	//
	// Setup the API services

	fastify.get('/rides', getRides);

	//
	// Start the API service

	fastify.listen({ host: '::0', port: 5050 }, (err, address) => {
		if (err) {
			console.log(err);
			process.exit(1);
		}
		Logger.info({ message: `Server listening at ${address}` });
	});

	//
})();
