/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { getSidebarLogoHandler } from './handlers/get-sidebar-logo.js';

/* * */

const NAMESPACE = '/platform/sidebar';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.post('/logo', { preHandler: authorizationMiddleware() }, getSidebarLogoHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
