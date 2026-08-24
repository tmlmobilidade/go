/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { getMeHandler } from './handlers/get-me.js';
import { listPlatformAgenciesHandler } from './handlers/list-platform-agencies.js';
import { sidebarLogoHandler } from './handlers/sidebar-logo.js';
import { updateMeHandler } from './handlers/update-me.js';

/* * */

const NAMESPACE = '/platform';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/me', { preHandler: authorizationMiddleware() }, getMeHandler);

		instance.put('/me', { preHandler: authorizationMiddleware() }, updateMeHandler);

		instance.get('/downloads', { preHandler: authorizationMiddleware() }, getMeHandler);

		instance.get('/notifications', { preHandler: authorizationMiddleware() }, getMeHandler);

		instance.post('/sidebar-logo', { preHandler: authorizationMiddleware() }, sidebarLogoHandler);

		instance.post('/agencies', { preHandler: authorizationMiddleware() }, listPlatformAgenciesHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
