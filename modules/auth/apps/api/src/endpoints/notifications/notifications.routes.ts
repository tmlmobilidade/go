/* * */

import { NotificationsController } from '@/endpoints/notifications/notifications.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const NAMESPACE = '/notifications';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/', { preHandler: authorizationMiddleware() }, NotificationsController.getAll);

		instance.get('/:id', { preHandler: authorizationMiddleware() }, NotificationsController.getById);

		instance.get('/:id/mark-as-read', { preHandler: authorizationMiddleware() }, NotificationsController.markAsRead);

		instance.delete('/:id', { preHandler: authorizationMiddleware() }, NotificationsController.delete);

		next();
	},
	{ prefix: NAMESPACE },
);
