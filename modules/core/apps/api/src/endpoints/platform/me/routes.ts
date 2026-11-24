/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { listMeUserHandler } from './handlers/list-me-user.js';
import { updateMePreferencesHandler } from './handlers/update-me-preferences.js';

/* * */

const NAMESPACE = '/platform/me';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/list-me-user', { preHandler: authorizationMiddleware() }, listMeUserHandler);

		instance.put('/update-preferences', { preHandler: authorizationMiddleware() }, updateMePreferencesHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
