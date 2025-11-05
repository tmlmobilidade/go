/* * */

import { UsersController } from '@/endpoints/users/users.controller.js';
import { authorizationMiddleware } from '@/middleware/authorization.middleware.js';
import { FastifyService } from '@go/connectors-fastify';
import { Permissions } from '@go/consts';

/* * */

const NAMESPACE = '/users';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		// GET /users
		instance.get('/', { preHandler: authorizationMiddleware(Permissions.users.scope, Permissions.users.actions.read) }, UsersController.getAll);

		// GET /users/:id
		instance.get('/:id', { preHandler: authorizationMiddleware(Permissions.users.scope, Permissions.users.actions.read) }, UsersController.getById);

		// POST /users
		instance.post('/', { preHandler: authorizationMiddleware(Permissions.users.scope, Permissions.users.actions.create) }, UsersController.create);

		// PUT /users/:id
		instance.put('/:id', { preHandler: authorizationMiddleware(Permissions.users.scope, Permissions.users.actions.update) }, UsersController.update);

		// DELETE /users/:id
		instance.delete('/:id', { preHandler: authorizationMiddleware(Permissions.users.scope, Permissions.users.actions.delete) }, UsersController.delete);

		// GET /users/me
		instance.get('/me', { preHandler: authorizationMiddleware() }, UsersController.getMe);

		// PUT /users/me
		instance.put('/me', { preHandler: authorizationMiddleware() }, UsersController.updateMe);

		next();
	},
	{ prefix: NAMESPACE },
);
