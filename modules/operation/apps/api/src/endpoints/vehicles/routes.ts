/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

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

		instance.get('/', { preHandler: authorizationMiddleware('vehicles', ['read']) }, listVehiclesHandler);

		instance.get('/:id', { preHandler: authorizationMiddleware('vehicles', ['read']) }, getVehicleHandler);

		instance.post('/', { preHandler: authorizationMiddleware('vehicles', ['create']) }, createVehicleHandler);

		instance.put('/:id', { preHandler: authorizationMiddleware('vehicles', ['update']) }, updateVehicleHandler);

		instance.get('/:id/lock', { preHandler: authorizationMiddleware('vehicles', ['lock']) }, lockVehicleHandler);

		instance.delete('/:id', { preHandler: authorizationMiddleware('vehicles', ['delete']) }, deleteVehicleHandler);

		instance.get('/:id/last-event', { preHandler: authorizationMiddleware('vehicles', ['read']) }, getLastVehicleEventHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
