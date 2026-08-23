/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { createUserHandler } from './handlers/create-user.js';
import { deleteUserHandler } from './handlers/delete-user.js';
import { getUserSimplifiedHandler } from './handlers/get-user-simplified.js';
import { getUserHandler } from './handlers/get-user.js';
import { listOrganizationsHandler } from './handlers/list-organizations.js';
import { listRolesHandler } from './handlers/list-roles.js';
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
			'/list',
			{ preHandler: authorizationMiddleware('users', ['read']) },
			listUsersHandler,
		);

		instance.get(
			'/list-roles',
			{ preHandler: authorizationMiddleware('users', ['read', 'create']) },
			listRolesHandler,
		);

		instance.get(
			'/list-organizations',
			{ preHandler: authorizationMiddleware('users', ['read', 'create']) },
			listOrganizationsHandler,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware('users', ['read']) },
			getUserHandler,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware('users', ['create']) },
			createUserHandler,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware('users', ['update']) },
			updateUserHandler,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware('users', ['delete']) },
			deleteUserHandler,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware('users', ['lock']) },
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
