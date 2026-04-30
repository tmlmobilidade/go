/* * */

import { StopsController } from '@/endpoints/stops/stops.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/stops';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			StopsController.getAll,
		);

		instance.get(
			'/valid-id',
			StopsController.getValidId,
		);

		instance.get(
			'/:id',
			StopsController.getById,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.stops.scope, [PermissionCatalog.all.stops.actions.create]) },
			StopsController.create,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.stops.scope, [PermissionCatalog.all.stops.actions.update]) },
			StopsController.update,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.stops.scope, [PermissionCatalog.all.stops.actions.lock]) },
			StopsController.lock,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.stops.scope, [PermissionCatalog.all.stops.actions.delete]) },
			StopsController.delete,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
