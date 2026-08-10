/* * */

import { getTime } from '@/endpoints/v1/debug/controllers/get-time.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const namespace = '/v1/debug';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/time', getTime);

		next();
	},
	{ prefix: namespace },
);
