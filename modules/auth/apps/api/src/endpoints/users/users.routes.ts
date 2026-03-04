/* * */

import { UsersController } from '@/endpoints/users/users.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/users';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.users.scope, [PermissionCatalog.all.users.actions.read]) },
			UsersController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.users.scope, [PermissionCatalog.all.users.actions.read]) },
			UsersController.getById,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.users.scope, [PermissionCatalog.all.users.actions.create]) },
			UsersController.create,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.users.scope, [PermissionCatalog.all.users.actions.update]) },
			UsersController.update,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.users.scope, [PermissionCatalog.all.users.actions.delete]) },
			UsersController.delete,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.users.scope, [PermissionCatalog.all.users.actions.lock]) },
			UsersController.lock,
		);

		instance.get(
			'/:id/simplified',
			{ preHandler: authorizationMiddleware() },
			UsersController.getSimplifiedById,
		);

		instance.get(
			'/me',
			{ preHandler: authorizationMiddleware() },
			UsersController.getMe,
		);

		instance.put(
			'/me',
			{ preHandler: authorizationMiddleware() },
			UsersController.updateMe,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
