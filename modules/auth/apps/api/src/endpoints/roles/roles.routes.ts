/* * */

import { RolesController } from '@/endpoints/roles/roles.controller.js';
import { authorizationMiddleware } from '@/middleware/authorization.middleware.js';
import { FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/roles';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		// GET /roles
		instance.get('/', { preHandler: authorizationMiddleware(PermissionCatalog.all.roles.scope, PermissionCatalog.all.roles.actions.read) }, RolesController.getAll);

		// GET /roles/:id
		instance.get('/:id', { preHandler: authorizationMiddleware(PermissionCatalog.all.roles.scope, PermissionCatalog.all.roles.actions.read) }, RolesController.getById);

		// POST /roles
		instance.post('/', { preHandler: authorizationMiddleware(PermissionCatalog.all.roles.scope, PermissionCatalog.all.roles.actions.create) }, RolesController.create);

		// PUT /roles/:id
		instance.put('/:id', { preHandler: authorizationMiddleware(PermissionCatalog.all.roles.scope, PermissionCatalog.all.roles.actions.update) }, RolesController.update);

		// DELETE /roles/:id
		instance.delete('/:id', { preHandler: authorizationMiddleware(PermissionCatalog.all.roles.scope, PermissionCatalog.all.roles.actions.delete) }, RolesController.delete);

		next();
	},
	{ prefix: NAMESPACE },
);
