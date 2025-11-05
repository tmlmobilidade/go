/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/connectors';
import { Permissions } from '@go/lib';
import { StopPermission } from '@go/types';

import { StopsController } from './stops.controller.js';

/* * */

const server = FastifyService.getInstance().server;
const namespace = '/stops';

/* * */

server.register(
	(instance, opts, next) => {
		// GET /stops
		instance.get(
			'/',
			{ preHandler: authorizationMiddleware<StopPermission>(Permissions.stops.scope, Permissions.stops.actions.read) },
			StopsController.getAll,
		);

		// GET /stops/:id
		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware<StopPermission>(Permissions.stops.scope, Permissions.stops.actions.read) },
			StopsController.getById,
		);

		// POST /stops
		instance.post(
			'/',
			{ preHandler: authorizationMiddleware<StopPermission>(Permissions.stops.scope, Permissions.stops.actions.create) },
			StopsController.create,
		);

		// PUT /stops/:id
		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware<StopPermission>(Permissions.stops.scope, Permissions.stops.actions.update) },
			StopsController.update,
		);

		// DELETE /stops/:id
		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware<StopPermission>(Permissions.stops.scope, Permissions.stops.actions.delete) },
			StopsController.delete,
		);

		next();
	},
	{ prefix: namespace },
);
