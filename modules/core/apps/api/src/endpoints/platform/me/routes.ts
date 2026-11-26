/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { listMePermissionsHandler } from './handlers/list-me-permissions.js';
import { listMeUserHandler } from './handlers/list-me-user.js';
import { startSessionReplayHandler } from './handlers/start-session-replay.js';
import { updateMePreferencesHandler } from './handlers/update-me-preferences.js';

/* * */

const NAMESPACE = '/platform/me';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/list-me-user', { preHandler: authorizationMiddleware() }, listMeUserHandler);

		instance.get('/list-me-permissions', { preHandler: authorizationMiddleware() }, listMePermissionsHandler);

		instance.post('/session-replay/start', { preHandler: authorizationMiddleware() }, startSessionReplayHandler);

		instance.put('/update-preferences', { preHandler: authorizationMiddleware() }, updateMePreferencesHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
