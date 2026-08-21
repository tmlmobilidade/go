/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { getMeHandler } from './handlers/get-me.js';
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

		instance.get('/agencies', { preHandler: authorizationMiddleware() }, getMeHandler);

		instance.get('/downloads', { preHandler: authorizationMiddleware() }, getMeHandler);

		instance.get('/notifications', { preHandler: authorizationMiddleware() }, getMeHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
