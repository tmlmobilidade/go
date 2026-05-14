/* * */

import { ParishesController } from '@/endpoints/v1/locations/parishes/parishes.controller.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, _, next) => {
		instance.get('/parishes', ParishesController.getParishes);
		next();
	},
	{ prefix: '/v1/locations' },
);
