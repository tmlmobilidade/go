/* * */

import { TimeController } from '@/endpoints/v1/status/time/time.controller.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, _, next) => {
		instance.get('/time', TimeController.getTime);
		next();
	},
	{ prefix: '/v1/status' },
);
