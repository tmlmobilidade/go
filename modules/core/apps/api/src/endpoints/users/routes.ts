/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { createUserHandler } from './handlers/create-user.js';
import { deleteUserHandler } from './handlers/delete-user.js';
import { getUserSimplifiedHandler } from './handlers/get-user-simplified.js';
import { getUserHandler } from './handlers/get-user.js';
import { listUsersHandler } from './handlers/list-users.js';
import { lockUserHandler } from './handlers/lock-user.js';
import { updateUserHandler } from './handlers/update-user.js';

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
			listUsersHandler,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.users.scope, [PermissionCatalog.all.users.actions.read]) },
			getUserHandler,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.users.scope, [PermissionCatalog.all.users.actions.create]) },
			createUserHandler,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.users.scope, [PermissionCatalog.all.users.actions.update]) },
			updateUserHandler,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.users.scope, [PermissionCatalog.all.users.actions.delete]) },
			deleteUserHandler,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.users.scope, [PermissionCatalog.all.users.actions.lock]) },
			lockUserHandler,
		);

		instance.get(
			'/:id/simplified',
			{ preHandler: authorizationMiddleware() },
			getUserSimplifiedHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
