/* * */

import { getRides } from '@/get-rides.js';
import { getSams } from '@/get-unique-sams.js';
import LOGGER from '@helperkits/logger';
import Fastify from 'fastify';

/* * */

(async function init() {
	//

	//
	// Setup variables

	const fastify = Fastify({ logger: false });

	//
	// Setup the API services

	fastify.get('/rides', getRides);

	fastify.get('/unique-sams', getSams);

	//
	// Start the API service

	fastify.listen({ host: '::0', port: 5050 }, (err, address) => {
		if (err) {
			console.log(err);
			process.exit(1);
		}
		LOGGER.info(`Server listening at ${address}`);
	});

	//
})();
