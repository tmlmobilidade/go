/* * */

import { ArrivalsController } from '@/endpoints/v1/network/arrivals/arrivals.controller.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, _, next) => {
		instance.get('/arrivals/by_stop/:id', ArrivalsController.getArrivalsByStop);
		instance.get('/arrivals/by_pattern/:id', ArrivalsController.getArrivalsByPattern);
		next();
	},
	{ prefix: '/v1/network' },
);
