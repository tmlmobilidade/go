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

		instance.get('/', AgenciesController.getAll);

		instance.get('/:id', { preHandler: authorizationMiddleware(PermissionCatalog.all.agencies.scope, PermissionCatalog.all.agencies.actions.read) }, AgenciesController.getById);

		instance.put('/:id', { preHandler: authorizationMiddleware(PermissionCatalog.all.agencies.scope, PermissionCatalog.all.agencies.actions.update) }, AgenciesController.update);

		next();
	},
	{ prefix: NAMESPACE },
);
