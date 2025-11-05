/* * */

import { AgenciesController } from '@/endpoints/agencies/agencies.controller.js';
import { authorizationMiddleware } from '@/middleware/authorization.middleware.js';
import { FastifyService } from '@tmlmobilidade/connectors';
import { Permissions } from '@tmlmobilidade/go-lib';

/* * */

const NAMESPACE = '/agencies';
const permission = Permissions.agencies;

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		// GET /agencies
		instance.get('/', AgenciesController.getAll);

		// GET /agencies/:id
		instance.get('/:id', { preHandler: authorizationMiddleware(permission.scope, permission.actions.read) }, AgenciesController.getById);

		// PUT /agencies/:id
		instance.put('/:id', { preHandler: authorizationMiddleware(permission.scope, permission.actions.update) }, AgenciesController.update);

		next();
	},
	{ prefix: NAMESPACE },
);
