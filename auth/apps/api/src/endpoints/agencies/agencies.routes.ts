/* * */

import { AgenciesController } from '@/endpoints/agencies/agencies.controller.js';
import authorizationMiddleware from '@/middleware/authorization.middleware.js';
import { FastifyService } from '@tmlmobilidade/connectors';
import { Permissions } from '@tmlmobilidade/lib';

/* * */

const NAMESPACE = '/agencies';
const permission = Permissions.agencies;

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		// GET /agencies
		instance.get('/', { preHandler: authorizationMiddleware(permission.scope, permission.actions.list) }, AgenciesController.getAll);

		// GET /agencies/:id
		instance.get('/:id', { preHandler: authorizationMiddleware(permission.scope, permission.actions.read) }, AgenciesController.getById);

		// POST /agencies
		instance.post('/', { preHandler: authorizationMiddleware(permission.scope, permission.actions.create) }, AgenciesController.create);

		// PUT /agencies/:id
		instance.put('/:id', { preHandler: authorizationMiddleware(permission.scope, permission.actions.update) }, AgenciesController.update);

		// DELETE /agencies/:id
		instance.delete('/:id', { preHandler: authorizationMiddleware(permission.scope, permission.actions.delete) }, AgenciesController.delete);

		next();
	},
	{ prefix: NAMESPACE },
);
