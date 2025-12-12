/* * */

import { StopsController } from '@/endpoints/stops/stops.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const server = FastifyService.getInstance().server;
const NAMESPACE = '/stops';

/* * */

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.stops.scope, [PermissionCatalog.all.stops.actions.read]) },
			StopsController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.stops.scope, [PermissionCatalog.all.stops.actions.read]) },
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

		instance.get(
			'/:id/archive',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.stops.scope, [PermissionCatalog.all.stops.actions.archive]) },
			StopsController.archive,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
