/* * */

import { UsersController } from '@/endpoints/users/users.controller.js';
import authorizationMiddleware from '@/middleware/authorization.middleware.js';
import FastifyService from '@/services/fastify.service.js';
import { Permissions } from '@tmlmobilidade/lib';
import { FastifyInstance } from 'fastify';

/* * */

const NAMESPACE = '/users';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		// GET /users
		instance.get('/', { preHandler: authorizationMiddleware(Permissions.users.scope, Permissions.users.actions.list) }, UsersController.getAll);

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

		next();
	},
	{ prefix: NAMESPACE },
);
