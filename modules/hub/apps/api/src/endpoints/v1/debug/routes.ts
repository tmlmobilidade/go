/* * */

import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { getTimeHandler } from './handlers/get-time.js';

/* * */

const NAMESPACE = '/v1/debug';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/time', getTimeHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
