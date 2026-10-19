/* * */

import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { listAgenciesHandler } from './handlers/list-agencies.js';

/* * */

const NAMESPACE = '/v1/agencies';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/', listAgenciesHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
