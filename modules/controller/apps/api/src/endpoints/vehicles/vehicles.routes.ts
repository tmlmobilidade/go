/* * */

import { VehiclesController } from '@/endpoints/vehicles/vehicles.controller.js';
import { FastifyService } from '@tmlmobilidade/fastify';

/* * */

const NAMESPACE = '/vehicles';

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		instance.get('/positions', VehiclesController.getPositions);
		next();
	},
	{ prefix: NAMESPACE },
);
