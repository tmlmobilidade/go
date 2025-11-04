/* * */

import { RidesController } from '@/endpoints/rides/rides.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/connectors';
import { Permissions } from '@tmlmobilidade/lib';
import { Ride } from '@tmlmobilidade/types';
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
