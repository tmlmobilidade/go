import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { dismissBannerHandler } from './handlers/dismiss-banner.js';
import { listActiveBannersHandler } from './handlers/list-active-banners.js';

/* * */

const NAMESPACE = '/platform/banners';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/active', { preHandler: authorizationMiddleware() }, listActiveBannersHandler);

		instance.post('/:id/dismiss', { preHandler: authorizationMiddleware() }, dismissBannerHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
