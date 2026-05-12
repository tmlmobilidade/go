/* * */

import { VehiclesController } from '@/endpoints/v1/network/vehicles/vehicles.controller.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, _, next) => {
		instance.get('/vehicles', VehiclesController.getVehiclesJson);
		instance.get('/vehicles.pb', VehiclesController.getVehiclesProtobuf);
		next();
	},
	{ prefix: '/v1/network' },
);
