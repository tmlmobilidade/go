/* * */

import { Permissions } from '@go/consts';
import { type StopPermission } from '@go/types';
import { authorizationMiddleware, FastifyService } from '@go/connectors-fastify';

import { ProposedChangesController } from './proposed-changes.controller.js';

/* * */

const server = FastifyService.getInstance().server;
const namespace = '/proposed-changes';

/* * */

server.register(
	(instance, opts, next) => {
		// GET /proposed-changes
		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(Permissions.proposed_changes.scope, Permissions.proposed_changes.actions.read) },
			ProposedChangesController.getAll,
		);

		// GET /proposed-changes/:id
		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(Permissions.proposed_changes.scope, Permissions.proposed_changes.actions.read) },
			ProposedChangesController.getById,
		);

		// POST /proposed-changes
		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(Permissions.proposed_changes.scope, Permissions.proposed_changes.actions.create) },
			ProposedChangesController.create,
		);

		// PUT /proposed-changes/:id
		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(Permissions.proposed_changes.scope, Permissions.proposed_changes.actions.approve) },
			ProposedChangesController.update,
		);

		// DELETE /proposed-changes/:id
		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware<StopPermission>(Permissions.proposed_changes.scope, Permissions.proposed_changes.actions.reject) },
			ProposedChangesController.delete,
		);

		next();
	},
	{ prefix: namespace },
);
