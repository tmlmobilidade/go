/* * */

import { getAppBannerHandler } from '@/endpoints/app-configs/handlers/get-app-banner.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

/* * */

const NAMESPACE = '/app-configs';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/app-banner', { preHandler: authorizationMiddleware() }, getAppBannerHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
