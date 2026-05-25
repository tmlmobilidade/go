/* * */

import { DebugController } from '@/endpoints/v1/debug/debug.controller.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const namespace = '/v1/debug';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/time', DebugController.getTime);

		next();
	},
	{ prefix: namespace },
);
