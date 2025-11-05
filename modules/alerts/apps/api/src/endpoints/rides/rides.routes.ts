/* * */

import { RidesController } from '@/endpoints/rides/rides.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-connectors-fastify';
import { Permissions } from '@tmlmobilidade/go-lib';
import { Ride } from '@tmlmobilidade/go-types';
import { FastifyInstance } from 'fastify';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
const namespace = '/rides';

/* * */

server.register(
	(instance, opts, next) => {
		// GET /rides
		instance.get(
			'/',
			{ preHandler: authorizationMiddleware<Ride>(Permissions.rides.scope, Permissions.rides.actions.analysis_read) },
			RidesController.getBatch,
		);

		next();
	},
	{ prefix: namespace },
);
