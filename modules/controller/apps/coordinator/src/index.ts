/* * */

import { getRides } from '@/get-rides.js';
import { Logger } from '@tmlmobilidade/logger';
import Fastify from 'fastify';

/* * */

await (async function init() {
	//

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
		Logger.info(`Server listening at ${address}`);
	});

	//
})();
