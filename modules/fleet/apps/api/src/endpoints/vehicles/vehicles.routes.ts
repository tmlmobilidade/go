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
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.fleet.scope, [PermissionCatalog.all.fleet.actions.read_vehicles]) },
			VehiclesController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.fleet.scope, [PermissionCatalog.all.fleet.actions.read_vehicles]) },
			VehiclesController.getById,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.fleet.scope, [PermissionCatalog.all.fleet.actions.create_vehicles]) },
			VehiclesController.create,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.fleet.scope, [PermissionCatalog.all.fleet.actions.update_vehicles]) },
			VehiclesController.update,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.fleet.scope, [PermissionCatalog.all.fleet.actions.lock_vehicles]) },
			VehiclesController.lock,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.fleet.scope, [PermissionCatalog.all.fleet.actions.delete_vehicles]) },
			VehiclesController.delete,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
