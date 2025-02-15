'use strict';

/* * */

import { ridesWebsocket } from '@/endpoints/rides.websocket.js';
import { vehicleEventsEndpoint } from '@/endpoints/vehicle-events.endpoint.js';
import fastifyWs from '@fastify/websocket';
import LOGGER from '@helperkits/logger';
import fastifyModule from 'fastify';

/* * */

const FastifyInstance = fastifyModule();

/* * */

FastifyInstance.register(fastifyWs);
FastifyInstance.register(ridesWebsocket);

FastifyInstance.get('/vehicle-events/:ride_id', vehicleEventsEndpoint);

/* * */

const connectionOptions = {
	host: process.env.FASTIFY_HOST || '0.0.0.0',
	port: Number(process.env.FASTIFY_PORT) || 5050,
};

const connectionHandler = (error: Error | null, address: string) => {
	LOGGER.success(`Server listening on ${address}`);
	if (error) {
		LOGGER.error(error.message);
		process.exit(1);
	}
};

FastifyInstance.listen(connectionOptions, connectionHandler);
