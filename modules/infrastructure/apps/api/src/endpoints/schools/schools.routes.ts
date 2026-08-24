/* * */

import { SchoolsController } from '@/endpoints/schools/schools.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/* * */

const NAMESPACE = '/schools';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.schools.scope, [PermissionCatalog.all.schools.actions.read]) },
			SchoolsController.getAll,
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

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.stops.scope, [PermissionCatalog.all.stops.actions.delete]) },
			StopsController.delete,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
