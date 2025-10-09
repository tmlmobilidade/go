/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/connectors';
import { Permissions } from '@tmlmobilidade/lib';
import { StopPermission } from '@tmlmobilidade/types';

import { ProposedChangesController } from './proposed-changes.controller.js';

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
			ProposedChangesController.getAll,
		);

		// GET /stops/:id
		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware<StopPermission>(Permissions.stops.scope, Permissions.stops.actions.read) },
			ProposedChangesController.getById,
		);

		// POST /stops
		instance.post(
			'/',
			{ preHandler: authorizationMiddleware<StopPermission>(Permissions.stops.scope, Permissions.stops.actions.create) },
			ProposedChangesController.create,
		);

		// PUT /stops/:id
		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware<StopPermission>(Permissions.stops.scope, Permissions.stops.actions.update) },
			ProposedChangesController.update,
		);

		// DELETE /stops/:id
		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware<StopPermission>(Permissions.stops.scope, Permissions.stops.actions.delete) },
			ProposedChangesController.delete,
		);

		next();
	},
	{ prefix: namespace },
);
