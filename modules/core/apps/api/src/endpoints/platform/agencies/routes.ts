/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { listAgenciesHandler } from './handlers/list-agencies.js';

/* * */

const NAMESPACE = '/platform/agencies';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/lookup', { preHandler: authorizationMiddleware() }, listAgenciesHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
