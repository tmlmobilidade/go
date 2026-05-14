/* * */

import { MessageController } from '@/endpoints/v1/status/message/message.controller.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, _, next) => {
		instance.get('/message', MessageController.getMessage);
		next();
	},
	{ prefix: '/v1/status' },
);
