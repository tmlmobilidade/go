/* * */

import { StopsController } from '@/endpoints/v1/network/stops/stops.controller.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, _, next) => {
		instance.get('/stops/:id', StopsController.getStopById);
		next();
	},
	{ prefix: '/v1/network' },
);
