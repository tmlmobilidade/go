/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { getBannerHandler } from './handlers/get-banner.js';

/* * */

const NAMESPACE = '/app-configs';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/banner', { preHandler: authorizationMiddleware() }, getBannerHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
