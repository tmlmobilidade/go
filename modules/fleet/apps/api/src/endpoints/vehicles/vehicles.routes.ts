/* * */

import { VehiclesController } from '@/endpoints/vehicles/vehicles.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/vehicles';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			VehiclesController.getAll,
		);

		instance.get(
			'/:id',
			VehiclesController.getById,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.vehicles.scope, [PermissionCatalog.all.vehicles.actions.create]) },
			VehiclesController.create,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.vehicles.scope, [PermissionCatalog.all.vehicles.actions.update]) },
			VehiclesController.update,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.vehicles.scope, [PermissionCatalog.all.vehicles.actions.lock]) },
			VehiclesController.lock,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.vehicles.scope, [PermissionCatalog.all.vehicles.actions.delete]) },
			VehiclesController.delete,
		);

		instance.get(
			'/:id/last-event',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.vehicles.scope, [PermissionCatalog.all.vehicles.actions.read]) },
			VehiclesController.getLastEvent,
		);

		instance.get(
			'/positions',
			VehiclesController.getPositions,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
