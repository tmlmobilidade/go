/* * */

import { createVehicle } from '@/endpoints/vehicles/controllers/create-vehicle.js';
import { deleteVehicle } from '@/endpoints/vehicles/controllers/delete-vehicle.js';
import { getAllVehicles } from '@/endpoints/vehicles/controllers/get-all-vehicles.js';
import { getLastVehicleEvent } from '@/endpoints/vehicles/controllers/get-last-vehicle-event.js';
import { getVehicleById } from '@/endpoints/vehicles/controllers/get-vehicle-by-id.js';
import { lockVehicle } from '@/endpoints/vehicles/controllers/lock-vehicle.js';
import { updateVehicle } from '@/endpoints/vehicles/controllers/update-vehicle.js';
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
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.vehicles.scope, [PermissionCatalog.all.vehicles.actions.read]) },
			getAllVehicles,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.vehicles.scope, [PermissionCatalog.all.vehicles.actions.read]) },
			getVehicleById,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.vehicles.scope, [PermissionCatalog.all.vehicles.actions.create]) },
			createVehicle,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.vehicles.scope, [PermissionCatalog.all.vehicles.actions.update]) },
			updateVehicle,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.vehicles.scope, [PermissionCatalog.all.vehicles.actions.lock]) },
			lockVehicle,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.vehicles.scope, [PermissionCatalog.all.vehicles.actions.delete]) },
			deleteVehicle,
		);

		instance.get(
			'/:id/last-event',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.vehicles.scope, [PermissionCatalog.all.vehicles.actions.read]) },
			getLastVehicleEvent,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
