/* * */

import { AgenciesController } from '@/endpoints/agencies/agencies.controller.js';
import { authorizationMiddleware } from '@/middleware/authorization.middleware.js';
import { FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/agencies';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		// GET /agencies
		instance.get('/', AgenciesController.getAll);

		// GET /agencies/:id
		instance.get('/:id', { preHandler: authorizationMiddleware(PermissionCatalog.all.agencies.scope, PermissionCatalog.all.agencies.actions.read) }, AgenciesController.getById);

		// PUT /agencies/:id
		instance.put('/:id', { preHandler: authorizationMiddleware(PermissionCatalog.all.agencies.scope, PermissionCatalog.all.agencies.actions.update) }, AgenciesController.update);

		next();
	},
	{ prefix: NAMESPACE },
);
