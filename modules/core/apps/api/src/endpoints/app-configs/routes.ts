/* * */

import { getBannerHandler } from '@/endpoints/app-configs/handlers/get-banner.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

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
