/* * */

import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { quickLinksHandler } from './handlers/quick-links.js';

/* * */

const NAMESPACE = '/home';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/quick-links', quickLinksHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
