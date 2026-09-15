/* * */

import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import Fastify from 'fastify';

import { getExtractionsHandler } from './handlers/get-extractions.js';

/* * */

//
// Initialize Sentry

try {
	await initSentryNode();
	Logger.startNodeLogs({ app: 'extractions-coordinator', message: 'Sentry Extractions Coordinator initialized', module: 'core', severity: 'info' });
} catch (error) {
	Logger.error({ error, message: 'Error initializing Sentry Extractions Coordinator' });
}

async function main() {
	//

	//
	// Setup the coordinator server

	const fastify = Fastify({ logger: false });

	//
	// Setup the coordinator handlers

	fastify.get('/extractions', getExtractionsHandler);

	//
	// Start the coordinator server

	const address = await fastify.listen({ host: '::0', port: 5050 });

	Logger.info({ message: `Server listening at ${address}` });

	//
}

/* * */

await main();
