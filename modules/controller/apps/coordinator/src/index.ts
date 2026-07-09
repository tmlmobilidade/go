/* * */

import { getRides } from '@/get-rides.js';
import { Dates } from '@tmlmobilidade/dates';
import { rides } from '@tmlmobilidade/interfaces';
import { initSentry, Logger } from '@tmlmobilidade/logger-backend';
import Fastify from 'fastify';

/* * */

await (async function init() {
	//

	// const now = Dates.now('Europe/Lisbon').unix_timestamp;
	// await rides.updateMany({ agency_id: { $in: ['crtm-aisa', 'crtm-laveloz'] }, start_time_scheduled: { $lt: now } }, { system_status: 'waiting' });
	// console.log('Marked crtm-aisa and crtm-laveloz rides as waiting');

	//
	// Initialize Sentry

	try {
		await initSentry();
		Logger.startLogs({ app: 'coordinator', message: 'Sentry Coordinator initialized', module: 'controller', severity: 'info' });
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
