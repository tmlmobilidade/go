/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { listNotificationsHandler } from './handlers/list-notifications.js';

/* * */

const NAMESPACE = '/platform/notifications';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/list', { preHandler: authorizationMiddleware() }, listNotificationsHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
