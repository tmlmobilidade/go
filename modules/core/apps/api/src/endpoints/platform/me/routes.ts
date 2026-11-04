/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { getMeHandler } from './handlers/get-me.js';
import { getSessionReplayHandler } from './handlers/get-session-replay.js';
import { startSessionReplayHandler } from './handlers/start-session-replay.js';
import { updateMePreferencesHandler } from './handlers/update-me-preferences.js';

/* * */

const NAMESPACE = '/platform/me';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/list', { preHandler: authorizationMiddleware() }, getMeHandler);

		instance.get('/session-replay', { preHandler: authorizationMiddleware() }, getSessionReplayHandler);

		instance.post('/session-replay/start', { preHandler: authorizationMiddleware() }, startSessionReplayHandler);

		instance.put('/update-preferences', { preHandler: authorizationMiddleware() }, updateMePreferencesHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
