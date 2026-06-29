/* * */

import { getRides } from '@/get-rides.js';
import { rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger';
import Fastify from 'fastify';

/* * */

await (async function init() {
	//

	// console.log('invalidating crtm-aisa rides');
	// await rides.updateMany({ agency_id: 'crtm-aisa' }, { system_status: 'waiting' });
	// console.log('Done');

	// console.log('invalidating crtm-laveloz rides');
	// await rides.updateMany({ agency_id: 'crtm-laveloz' }, { system_status: 'waiting' });
	// console.log('Done');

	//
	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'coordinator', message: 'Sentry Coordinator initialized', module: 'controller', severity: 'info' });
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
