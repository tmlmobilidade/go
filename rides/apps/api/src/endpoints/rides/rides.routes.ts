/* * */

import { RidesController } from '@/endpoints/rides/rides.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/connectors';
import { Permissions } from '@tmlmobilidade/lib';
import { Alert } from '@tmlmobilidade/types';
import { FastifyInstance } from 'fastify';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
const namespace = '/rides';

/* * */

server.register(
	(instance, opts, next) => {
		// GET /rides
		instance.get('/', { preHandler: authorizationMiddleware<Alert>(Permissions.rides.scope, Permissions.rides.actions.list) }, RidesController.getBatch);

		// GET /rides/:id
		// instance.get('/:id', { preHandler: authorizationMiddleware<Alert>(Permissions.rides.scope, Permissions.rides.actions.read) }, RidesController.getById);

		next();
	},
	{ prefix: namespace },
);
