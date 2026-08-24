/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { deleteNotificationHandler } from './handlers/delete-notification.js';
import { getNotificationHandler } from './handlers/get-notification.js';
import { listNotificationsHandler } from './handlers/list-notifications.js';
import { markNotificationAsReadHandler } from './handlers/mark-notification-as-read.js';

/* * */

const NAMESPACE = '/notifications';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/', { preHandler: authorizationMiddleware() }, listNotificationsHandler);

		instance.get('/:id', { preHandler: authorizationMiddleware() }, getNotificationHandler);

		instance.get('/:id/mark-as-read', { preHandler: authorizationMiddleware() }, markNotificationAsReadHandler);

		instance.delete('/:id', { preHandler: authorizationMiddleware() }, deleteNotificationHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
