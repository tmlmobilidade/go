/* * */

import { RolesController } from '@/endpoints/roles/roles.controller.js';
import { authorizationMiddleware } from '@/middleware/authorization.middleware.js';
import { FastifyService } from '@tmlmobilidade/connectors-fastify';
import { Permissions } from '@tmlmobilidade/consts';

/* * */

const NAMESPACE = '/roles';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		// GET /roles
		instance.get('/', { preHandler: authorizationMiddleware(Permissions.roles.scope, Permissions.roles.actions.read) }, RolesController.getAll);

		// GET /roles/:id
		instance.get('/:id', { preHandler: authorizationMiddleware(Permissions.roles.scope, Permissions.roles.actions.read) }, RolesController.getById);

		// POST /roles
		instance.post('/', { preHandler: authorizationMiddleware(Permissions.roles.scope, Permissions.roles.actions.create) }, RolesController.create);

		// PUT /roles/:id
		instance.put('/:id', { preHandler: authorizationMiddleware(Permissions.roles.scope, Permissions.roles.actions.update) }, RolesController.update);

		// DELETE /roles/:id
		instance.delete('/:id', { preHandler: authorizationMiddleware(Permissions.roles.scope, Permissions.roles.actions.delete) }, RolesController.delete);

		next();
	},
	{ prefix: NAMESPACE },
);
