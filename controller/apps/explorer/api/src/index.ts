'use strict';

/* * */

import { apexT11Endpoint } from '@/endpoints/apex-t11.endpoint.js';
import { hashedShapeEndpoint } from '@/endpoints/hashed-shape.endpoint.js';
import { hashedTripEndpoint } from '@/endpoints/hashed-trip.endpoint.js';
import { rideEndpoint } from '@/endpoints/ride.endpoint.js';
import { ridesWebsocket } from '@/endpoints/rides.websocket.js';
import { vehicleEventsEndpoint } from '@/endpoints/vehicle-events.endpoint.js';
import authorizationMiddleware from '@/middleware/authorization.middleware.js';
import fastifyCookie from '@fastify/cookie';
import fastifyWs from '@fastify/websocket';
import LOGGER from '@helperkits/logger';
import { Permissions } from '@tmlmobilidade/core/lib';
import { type Ride } from '@tmlmobilidade/core/types';
import fastifyModule from 'fastify';

/* * */

const FastifyInstance = fastifyModule();

/* * */

FastifyInstance.register(fastifyWs);
FastifyInstance.register(fastifyCookie);
FastifyInstance.register(ridesWebsocket);

FastifyInstance.get('/rides/:ride_id/ride', { preHandler: authorizationMiddleware<Ride>(Permissions.rides.scope, Permissions.rides.actions.list) }, rideEndpoint);
FastifyInstance.get('/rides/:ride_id/vehicle-events', { preHandler: authorizationMiddleware<Ride>(Permissions.rides.scope, Permissions.rides.actions.list) }, vehicleEventsEndpoint);
FastifyInstance.get('/rides/:ride_id/apex-t11', { preHandler: authorizationMiddleware<Ride>(Permissions.rides.scope, Permissions.rides.actions.list) }, apexT11Endpoint);
FastifyInstance.get('/rides/:ride_id/hashed-trip', { preHandler: authorizationMiddleware<Ride>(Permissions.rides.scope, Permissions.rides.actions.list) }, hashedTripEndpoint);
FastifyInstance.get('/rides/:ride_id/hashed-shape', { preHandler: authorizationMiddleware<Ride>(Permissions.rides.scope, Permissions.rides.actions.list) }, hashedShapeEndpoint);

/* * */

const connectionOptions = {
	host: process.env.FASTIFY_HOST || '0.0.0.0',
	port: Number(process.env.API_PORT) || 5050,
};

const connectionHandler = (error: Error | null, address: string) => {
	LOGGER.success(`Server listening on ${address}`);
	if (error) {
		LOGGER.error(error.message);
		process.exit(1);
	}
};

FastifyInstance.listen(connectionOptions, connectionHandler);
