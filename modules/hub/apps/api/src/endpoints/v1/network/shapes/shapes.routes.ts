/* * */

import { ShapesController } from '@/endpoints/v1/network/shapes/shapes.controller.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, _, next) => {
		instance.get('/shapes/:id', ShapesController.getShapeById);
		next();
	},
	{ prefix: '/v1/network' },
);
