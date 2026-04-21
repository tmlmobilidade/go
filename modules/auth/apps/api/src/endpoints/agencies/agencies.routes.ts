/* * */

import { AgenciesController } from '@/endpoints/agencies/agencies.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/agencies';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			AgenciesController.getAll,
		);

		instance.get(
			'/:id',
			AgenciesController.getById,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.agencies.scope, [PermissionCatalog.all.agencies.actions.update]) },
			AgenciesController.update,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.agencies.scope, [PermissionCatalog.all.agencies.actions.lock]) },
			AgenciesController.lock,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
