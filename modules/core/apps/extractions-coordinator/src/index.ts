/* * */

import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import Fastify from 'fastify';

import { getExtractionsHandler } from './handlers/get-extractions.js';

/* * */

//
await (async function init() {
	//

	//
	// Setup variables

	const fastify = Fastify({ logger: false });

	//
	// Setup the API services

	fastify.get('/extractions', getExtractionsHandler);

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
