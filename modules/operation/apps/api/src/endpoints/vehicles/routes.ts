/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { createVehicleHandler } from './handlers/create-vehicle.js';
import { deleteVehicleHandler } from './handlers/delete-vehicle.js';
import { getLastVehicleEventHandler } from './handlers/get-last-vehicle-event.js';
import { getVehicleHandler } from './handlers/get-vehicle.js';
import { listVehiclesHandler } from './handlers/list-vehicles.js';
import { lockVehicleHandler } from './handlers/lock-vehicle.js';
import { updateVehicleHandler } from './handlers/update-vehicle.js';

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
			listVehiclesHandler,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.vehicles.scope, [PermissionCatalog.all.vehicles.actions.read]) },
			getVehicleHandler,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.vehicles.scope, [PermissionCatalog.all.vehicles.actions.create]) },
			createVehicleHandler,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.vehicles.scope, [PermissionCatalog.all.vehicles.actions.update]) },
			updateVehicleHandler,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.vehicles.scope, [PermissionCatalog.all.vehicles.actions.lock]) },
			lockVehicleHandler,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.vehicles.scope, [PermissionCatalog.all.vehicles.actions.delete]) },
			deleteVehicleHandler,
		);

		instance.get(
			'/:id/last-event',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.vehicles.scope, [PermissionCatalog.all.vehicles.actions.read]) },
			getLastVehicleEventHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
