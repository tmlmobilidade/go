/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { listAgenciesHandler } from './list-agencies.js';

/* * */

const NAMESPACE = '/agencies';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware() },
			listAgenciesHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
