/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { getMeHandler } from './handlers/get-me.js';
import { getSidebarLogoHandler } from './handlers/get-sidebar-logo.js';
import { updateMePreferencesHandler } from './handlers/update-me-preferences.js';

/* * */

const NAMESPACE = '/platform';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/me', { preHandler: authorizationMiddleware() }, getMeHandler);

		instance.put('/update-me-preferences', { preHandler: authorizationMiddleware() }, updateMePreferencesHandler);

		instance.get('/downloads', { preHandler: authorizationMiddleware() }, getMeHandler);

		instance.get('/notifications', { preHandler: authorizationMiddleware() }, getMeHandler);

		instance.post('/sidebar-logo', { preHandler: authorizationMiddleware() }, getSidebarLogoHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
