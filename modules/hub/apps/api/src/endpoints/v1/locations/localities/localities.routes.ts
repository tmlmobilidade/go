/* * */

import { LocalitiesController } from '@/endpoints/v1/locations/localities/localities.controller.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, _, next) => {
		instance.get('/localities', LocalitiesController.getLocalities);
		next();
	},
	{ prefix: '/v1/locations' },
);
