/* * */

import { RolesController } from '@/endpoints/roles/roles.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/roles';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.roles.scope, [PermissionCatalog.all.roles.actions.read]) },
			RolesController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.roles.scope, [PermissionCatalog.all.roles.actions.read]) },
			RolesController.getById,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.roles.scope, [PermissionCatalog.all.roles.actions.create]) },
			RolesController.create,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.roles.scope, [PermissionCatalog.all.roles.actions.update]) },
			RolesController.update,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.roles.scope, [PermissionCatalog.all.roles.actions.delete]) },
			RolesController.delete,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.roles.scope, [PermissionCatalog.all.roles.actions.lock]) },
			RolesController.lock,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
