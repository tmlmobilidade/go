/* * */

import { PatternsController } from '@/endpoints/v1/network/patterns/patterns.controller.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, _, next) => {
		instance.get('/patterns/:id', PatternsController.getPatternById);
		next();
	},
	{ prefix: '/v1/network' },
);
