/* * */

import { DistrictsController } from '@/endpoints/v1/locations/districts/districts.controller.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, _, next) => {
		instance.get('/districts', DistrictsController.getDistricts);
		next();
	},
	{ prefix: '/v1/locations' },
);
